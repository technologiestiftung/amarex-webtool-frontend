import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import Feature from "ol/Feature";
import axios from "axios";
import handleAxiosResponse from "../utils/handleAxiosResponse.js";
import { rawLayerList } from "@masterportal/masterportalapi/src";

/**
 * Handles the GetFeatureInfo request.
 * Implementation rule to show GFI, derived from known services:
 * 1. Nodes exist
 * 2. No <body> exists, or it has child nodes
 * 3. No <tbody> exists, or it has child nodes
 * @param {String} mimeType - text/xml | text/html
 * @param {String} url - the GetFeatureInfo request url
 * @param {ol/layer} layer - layer that's requested (used to infer credential use)
 * @returns {Promise<module:ol/Feature[]>}  Promise object represents the GetFeatureInfo request
 */
export function requestGfi(mimeType, url, layer) {
  const layerSpecification = rawLayerList.getLayerWhere({
      id: layer.get("id"),
    }),
    layerIsSecured = Boolean(layerSpecification?.isSecured);

  return axios({
    method: "get",
    withCredentials: layerIsSecured,
    url,
  })
    .then((response) => handleAxiosResponse(response, "requestGfi"))
    .then((responseData) => {
      let parsedDocument = null;

      if (mimeType === "text/xml") {
        parsedDocument = parseDocumentString(responseData, mimeType);
      } else if (mimeType === "text/html") {
        parsedDocument = parseDocumentString(responseData, mimeType);

        if (
          parsedDocument.childNodes.length > 0 &&
          (!parsedDocument.getElementsByTagName("body")[0] ||
            parsedDocument.getElementsByTagName("body")[0].children.length >
              0) &&
          (!parsedDocument.getElementsByTagName("tbody")[0] ||
            parsedDocument.getElementsByTagName("tbody")[0].children.length > 0)
        ) {
          return responseData;
        }

        return null;
      } else if (mimeType === "application/json") {
        parsedDocument = responseData;
      }

      return parsedDocument;
    })
    .then((doc) => {
      if (mimeType === "text/xml") {
        return parseFeatures(doc);
      }
      return doc;
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * parses the given string as DOM document
 * @throws will throw an error - parsing errors are reported on the console by DOMParser
 * @param {String} documentString the string to parse
 * @param {String} mimeType the mimeType to use (text/xml, text/html) - other formats are currently not supported and may not work
 * @param {Function} [parseFromStringOpt=null] a function(documentString, mimeType) for parsing the document (for testing only)
 * @returns {(Document|XMLDocument)}  a valid document, free of parser errors
 */
export function parseDocumentString(
  documentString,
  mimeType,
  parseFromStringOpt = null,
) {
  const domParser = new DOMParser(),
    doc =
      typeof parseFromStringOpt === "function"
        ? parseFromStringOpt(documentString, mimeType)
        : domParser.parseFromString(documentString, mimeType);
  let errObj = null,
    parsererror = null;

  if (
    doc === null ||
    typeof doc !== "object" ||
    (!(doc instanceof Document) && doc.constructor.name !== "XMLDocument")
  ) {
    // parsing errors are reported on the console by DOMParser
    throw Error(
      "requestGfi, checkParsingProcess: the received doc is no valid Document nor XMLDocument",
    );
  }

  parsererror = doc.getElementsByTagName("parsererror");

  if (parsererror instanceof HTMLCollection && parsererror.length > 0) {
    for (errObj of parsererror) {
      console.warn("requestGfi, parseDocumentString: parsererror", errObj);
    }
    throw Error(
      "requestGfi, parseDocumentString: the parsererror has reported a problem",
    );
  }

  return doc;
}

/**
 * Parses the response into openlayers features.
 * A distinction is made between ESRI services and OGC-conform services.
 * OpenLayers supports OGC-conform services that have the root element `FeatureCollection` or `msGMLOutput`.
 * @throws Will throw an error.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
export function parseFeatures(doc) {
  const firstChild = doc.firstChild.tagName,
    gmlNamespace = "http://www.opengis.net/gml";
  let features = [],
    box = null,
    coordinates = null;

  if (
    firstChild.includes("FeatureCollection") ||
    firstChild.includes("msGMLOutput")
  ) {
    features = parseOgcConformFeatures(doc);
    box = doc.getElementsByTagNameNS(gmlNamespace, "Box");
    if (box.length === 1 && features.length > 1) {
      coordinates = box[0].getElementsByTagNameNS(
        gmlNamespace,
        "coordinates",
      )[0];
      features.unshift(String(coordinates.innerHTML).split(/[, ]/));
    }
  } else if (firstChild.includes("GetFeatureInfoResponse")) {
    features = parseQGisFeatures(doc);
  } else {
    features = parseEsriFeatures(doc);
  }

  return features;
}

/**
 * Parse the response of a gfi from an OGC-conform service.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
function parseOgcConformFeatures(doc) {
  const gfiFormat = new WMSGetFeatureInfo();

  return gfiFormat.readFeatures(doc);
}

/**
 * Parse the response of a gfi from an ESRi service.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
function parseEsriFeatures(doc) {
  const features = [];

  for (const element of doc.getElementsByTagName("FIELDS")) {
    const feature = new Feature();

    for (const attribute of element.attributes) {
      feature.set(attribute.localName, attribute.value);
    }
    features.push(feature);
  }

  return features;
}

/**
 * Parse the GFI response from a QGIS service.
 * @param {XMLDocument} doc Data to be parsed.
 * @returns {module:ol/Feature[]} Collection of openlayers features.
 */
function parseQGisFeatures(doc) {
  const features = [];

  for (const element of doc.getElementsByTagName("Feature")) {
    const feature = new Feature();

    for (const maybeAttribute of element.children) {
      if (maybeAttribute.tagName === "Attribute") {
        const attributeName = maybeAttribute.attributes?.name?.value,
          attributeValue = maybeAttribute.attributes?.value?.value;

        if (attributeName && typeof attributeValue !== "undefined") {
          feature.set(attributeName, attributeValue);
        }
      }
    }
    features.push(feature);
  }

  return features;
}
