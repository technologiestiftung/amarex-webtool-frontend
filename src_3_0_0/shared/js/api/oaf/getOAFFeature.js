import axios from "axios";
import isObject from "../../utils/isObject";
import {GeoJSON} from "ol/format";

/**
 * Gets all features of given collection.
 * @param {String} baseUrl The base url.
 * @param {String} collection The collection.
 * @param {Number} limit The limit of features per request.
 * @param {String} filter The filter. See https://ogcapi.ogc.org/features/ for more information.
 * @param {String} filterCrs The filter crs. Needs to be set if a filter is used.
 * @returns {Promise} An promise which resolves an array of oaf features.
 */
async function getOAFFeatureGet (baseUrl, collection, limit = 400, filter = undefined, filterCrs = undefined) {
    if (typeof baseUrl !== "string") {
        return new Promise((resolve, reject) => {
            reject(new Error(`Please provide a valid base url! Got ${baseUrl}`));
        });
    }
    if (typeof collection !== "string") {
        return new Promise((resolve, reject) => {
            reject(new Error(`Please provide a collection! Got ${collection}`));
        });
    }
    if (typeof filter !== "undefined" && typeof filterCrs === "undefined") {
        return new Promise((resolve, reject) => {
            reject(new Error(`Please provide a valid crs for the oaf filter! Got ${filterCrs}`));
        });
    }
    const url = `${baseUrl}/collections/${collection}/items?limit=${limit}`,
        extendedUrl = filter ? `${url}&filter=${filter}&filter-crs=${filterCrs}` : url,
        result = [];

    return this.oafRecursionHelper(result, extendedUrl);
}
/**
 * An recursion helper which calls the given url and pushes the result in the given 'result' reference.
 * @param {Object[]} result An array of objects.
 * @param {String} url The url to call.
 * @returns {Promise} an promise which resolves all oaf features as geojson.
 */
async function oafRecursionHelper (result, url) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            headers: {
                accept: "application/geo+json"
            }
        }).then(async (response) => {
            const nextLink = this.getNextLinkFromFeatureCollection(response?.data);

            if (Array.isArray(response?.data?.features)) {
                result.push(...response.data.features);
            }
            if (typeof nextLink === "string") {
                try {
                    resolve(await this.oafRecursionHelper(result, nextLink, onerror));
                }
                catch (error) {
                    reject(error);
                }
            }
            else {
                resolve(result);
            }
        }).catch(error => reject(error));
    });
}

/**
 * Reads the given features or featureCollections and parse them to ol/GeoJSON.
 * @param {Object[]|ol/} features The array of features.
 * @param {Object} [options={}] The options to pass to the GeoJSON constructor.
 * @returns {ol/Feature[]} an array of ol features.
 */
function readAllOAFToGeoJSON (features, options = {}) {
    if (!Array.isArray(features)) {
        return features;
    }
    const geoJSONParser = new GeoJSON(options),
        geojson = geoJSONParser.readFeatures(
            {
                type: "FeatureCollection",
                features
            }
        );

    return geojson;
}

/**
 * Parses the given feature collection for the next nextLink.
 * @param {Object} featureCollection the feature collection
 * @returns {String|Boolean} the next link or false if no next link exists
 */
function getNextLinkFromFeatureCollection (featureCollection) {
    if (!Array.isArray(featureCollection?.links)) {
        return false;
    }
    const len = featureCollection.links.length;

    for (let i = 0; i < len; i++) {
        if (
            isObject(featureCollection.links[i])
            && typeof featureCollection.links[i].href === "string"
            && featureCollection.links[i].rel === "next"
            && featureCollection.links[i].type === "application/geo+json"
        ) {
            return featureCollection.links[i].href;
        }
    }
    return false;
}

export default {
    getOAFFeatureGet,
    readAllOAFToGeoJSON,
    oafRecursionHelper,
    getNextLinkFromFeatureCollection
};
