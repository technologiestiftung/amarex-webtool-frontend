import axios from "axios";
import Feature from "ol/Feature";
import { Point, Polygon } from "ol/geom";
import WFS from "ol/format/WFS";
import handleAxiosResponse from "../../../shared/js/utils/handleAxiosResponse";
import { buildFilter, buildStoredFilter } from "./buildFilter";

/**
 * Makes sure that the filter is ready to be used.
 * When in the config no outer clause is defined, this is added here.
 *
 * @param {(XML | XML[])} filter The filter to be adjusted.
 * @returns {String} The adjusted Filter.
 */
function adjustFilter(filter) {
  if (Array.isArray(filter)) {
    if (filter.length === 0) {
      return "";
    }
    return filter.length > 1 ? `<And>${filter.join("")}</And>` : filter[0];
  }

  return filter;
}

/**
 * Parses the response from a WFS-G as the features can not be parsed by OL (yet).
 *
 * @param {String} responseData The response data returned by the WFS-G; GML string.
 * @param {String|String[]} namespaces The namespaces of the service.
 * @param {String} memberSuffix The suffix of the feature in the FeatureCollection.
 * @returns {module:ol/Feature[]} Array of Features returned from the service.
 */
function parseGazetteerResponse(responseData, namespaces, memberSuffix) {
  const attributes = {},
    features = [],
    namespaceArray = Array.isArray(namespaces) ? namespaces : [namespaces],
    gmlFeatures = new DOMParser()
      .parseFromString(responseData, "application/xml")
      .getElementsByTagName(`wfs:${memberSuffix}`);

  if (gmlFeatures.length === 0) {
    return features;
  }

  Array.from(gmlFeatures).forEach((feature) => {
    // read attributes by all configured namespaces
    namespaceArray
      .map((namespace) => feature.getElementsByTagNameNS(namespace, "*"))
      .map((htmlCollection) => Object.values(htmlCollection))
      .flat(1)
      .forEach((attribute) => {
        attributes[attribute.localName] = attribute.textContent;
      });

    if (feature.getElementsByTagName("iso19112:position").length > 0) {
      attributes.geometry = new Point(
        feature
          .getElementsByTagName("iso19112:position")[0]
          .getElementsByTagName("gml:pos")[0]
          .textContent.split(" ")
          .map((coordinate) => parseFloat(coordinate)),
      );
    }

    if (feature.getElementsByTagName("iso19112:geographicExtent").length > 0) {
      // Reads the coordinates from the response and prepares them to a readable format for the OL Polygon.
      attributes.geographicExtent = new Polygon([
        feature
          .getElementsByTagName("iso19112:geographicExtent")[0]
          .getElementsByTagName("gml:posList")[0]
          .textContent.split(" ")
          .map((coordinate) => parseFloat(coordinate))
          .reduce(
            (accumulator, _, index, array) =>
              index % 2 === 0
                ? [...accumulator, [array[index], array[index + 1]]]
                : accumulator,
            [],
          ),
      ]);
    }

    features.push(new Feature(attributes));
  });

  return features;
}

/**
 * Returns the version, storedQuery and filter to the request url for a WFS@2.0.0.
 * @param {Object} requestUrl The Url object.
 * @param {String} filter The filter consisting of Url parameters to be added to the request url.
 * @param {String} storedQueryId The Id of the stored Query of the service.
 * @returns {String} The added parts for the request url.
 */
function storedFilter(requestUrl, filter, storedQueryId) {
  requestUrl.searchParams.set("version", "2.0.0");
  if (filter !== "") {
    const filterSplitted = filter.split("&");

    requestUrl.searchParams.set("StoredQuery_ID", storedQueryId);
    filterSplitted.forEach((param) => {
      if (param) {
        const split = param.split("=");

        requestUrl.searchParams.set(split[0], split[1]);
      }
    });
  }
  return requestUrl;
}

/**
 * Returns the version and filter to the request url for a WFS@1.1.0
 * @param {Object} requestUrl The Url object.
 * @param {XML[]} filter The filter written in XML.
 * @returns {String} The added parts for the request Url.
 */
function xmlFilter(requestUrl, filter) {
  const value = `<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">${adjustFilter(filter)}</ogc:Filter>`;

  requestUrl.searchParams.set("version", "1.1.0");
  requestUrl.searchParams.set("filter", value);
  return requestUrl;
}

let currentRequest = null;

/**
 * Searches the service for features based on the build or given filter.
 *
 * @param {Object} store Vuex store.
 * @param {Object} currentInstance The currently selected searchInstance.
 * @param {Object[]} currentInstance.literals Array of literals.
 * @param {?Object} [currentInstance.requestConfig.gazetteer] Declares whether the used WFS service is a WFS-G, which needs to be parsed differently.
 * @param {String[]} [currentInstance.requestConfig.gazetteer.namespaces] The namespaces of the service.
 * @param {String} [currentInstance.requestConfig.gazetteer.memberSuffix] The suffix of the feature in the FeatureCollection.
 * @param {String} currentInstance.requestConfig.layerId Id of the layer defined in the services.json. Here it is used to check if that is the case or if the layer was defined in the rest-service.json.
 * @param {Number} currentInstance.requestConfig.maxFeatures The maximum amount of features allowed.
 * @param {String} currentInstance.requestConfig.storedQueryId Id of the stored Query. If given, a WFS@2.0.0 is queried.
 * @param {Object} service The service to send the request to.
 * @param {?String} [singleValueFilter = null] If given, this filter should be used.
 * @param {?String} [featureType = null] FeatureType of the features which should be requested. Only given for queries for suggestions.
 * @returns {Promise} If the send request was successful, the found features are converted from XML to OL Features and returned.
 */
function searchFeatures(
  store,
  {
    literals,
    requestConfig: { gazetteer = null, layerId, maxFeatures, storedQueryId },
  },
  service,
  singleValueFilter = null,
  featureType = null,
) {
  const fromServicesJson = Boolean(layerId);
  let filter;

  if (singleValueFilter) {
    filter = singleValueFilter;
  } else {
    filter = storedQueryId
      ? buildStoredFilter(literals)
      : buildFilter(literals);
  }

  return sendRequest(
    store,
    service,
    filter,
    fromServicesJson,
    storedQueryId,
    maxFeatures,
    featureType,
  ).then((data) => {
    // NOTE: This extra case can be removed when OL can parse WFS-G services with the WFS.readFeatures function.
    if (gazetteer) {
      return parseGazetteerResponse(
        data,
        gazetteer.namespaces,
        gazetteer.memberSuffix,
      );
    }
    return new WFS({ version: storedQueryId ? "2.0.0" : "1.1.0" }).readFeatures(
      data,
    );
  });
}

/**
 * Creates the url depending on params.
 * @param {String} urlString The base Url as defined in the services.json or rest-services.json.
 * @param {String} typeName If the Url was defined in the services.json, the typeName is set to be added to the Url.
 * @param {(XML | XML[] | String)} filter The filter to constrain the returned features.
 * @param {Boolean} fromServicesJson Whether the service was defined in the services.json or the rest-service.json.
 * @param {String} storedQueryId The Id of the Stored Query. Present when using a WFS@2.0.0.
 * @param {(Number | String)} [maxFeatures = 8] Maximum amount of features to be returned by the service. If it is the String 'showAll' there are no restrictions.
 * @param {?String} [featureType = null] FeatureType of the features which should be requested. Only given for queries for suggestions.
 * @returns {Object} the created Url
 */
function createUrl(
  urlString,
  typeName,
  filter,
  fromServicesJson,
  storedQueryId,
  maxFeatures,
  featureType,
) {
  let requestUrl = new URL(urlString);

  if (fromServicesJson) {
    requestUrl.searchParams.set("service", "WFS");
    requestUrl.searchParams.set("request", "GetFeature");
    requestUrl.searchParams.set(
      "typeName",
      featureType ? featureType : typeName,
    );
  }
  if (maxFeatures !== "showAll") {
    requestUrl.searchParams.set("maxFeatures", maxFeatures);
  }
  if (storedQueryId) {
    requestUrl = storedFilter(requestUrl, filter, storedQueryId);
  } else {
    requestUrl = xmlFilter(requestUrl, filter);
  }
  return requestUrl;
}

/**
 * Builds the request url and sends a GetFeature request via GET to the service.
 *
 * @param {Object} store Vuex store.
 * @param {Object} service The service to send the request to.
 * @param {String} service.url The base Url as defined in the services.json or rest-services.json.
 * @param {String} service.typeName If the Url was defined in the services.json, the typeName is set to be added to the Url.
 * @param {(XML | XML[] | String)} filter The filter to constrain the returned features.
 * @param {Boolean} fromServicesJson Whether the service was defined in the services.json or the rest-service.json.
 * @param {String} storedQueryId The Id of the Stored Query. Present when using a WFS@2.0.0.
 * @param {(Number | String)} [maxFeatures = 8] Maximum amount of features to be returned by the service. If it is the String 'showAll' there are no restrictions.
 * @param {?String} [featureType = null] FeatureType of the features which should be requested. Only given for queries for suggestions.
 * @returns {Promise} If the request was successful, the data of the response gets resolved.
 *                    If an error occurs (e.g. the service is not reachable or there was no such feature) the error is caught and the message is displayed as an alert.
 */
function sendRequest(
  store,
  { url, typeName },
  filter,
  fromServicesJson,
  storedQueryId,
  maxFeatures = 8,
  featureType = null,
) {
  const requestUrl = createUrl(
    url,
    typeName,
    filter,
    fromServicesJson,
    storedQueryId,
    maxFeatures,
    featureType,
  );

  if (currentRequest) {
    currentRequest.cancel();
  }
  currentRequest = axios.CancelToken.source();

  return axios
    .get(decodeURI(requestUrl))
    .then((response) =>
      handleAxiosResponse(response, "WfsSearch, searchFeatures, sendRequest"),
    )
    .catch((error) =>
      store.dispatch(
        "Alerting/addSingleAlert",
        i18next.t("common:modules.wfsSearch.searchError", { error }),
      ),
    );
}

export default {
  createUrl,
  searchFeatures,
};
