import "./2DMapRadioBridge";
import "./2DMapViewRadioBridge";
import "./3DMapRadioBridge";

import ObliqueMap from "../../../modules/core/obliqueMap";
import store from "../../app-store";

/**
 * Create the 3D map.
 * @param {Object} configJs The settings of config.json file.
 * @returns {void}
 */
async function create3DMap (configJs) {
    if (Cesium && configJs.startingMap3D) {
        await store.commit("Maps/setMode", "2D");
        Radio.trigger("Map", "mapChangeTo3d");
    }

}

/**
 * Create the oblique map.
 * @param {Object} configJs The config.js file.
 * @returns {void}
 */
function createObliqueMap (configJs) {
    if (configJs?.obliqueMap) {
        Radio.trigger("Map", "setObliqueMap", new ObliqueMap({}));
    }
}

/**
 * Create the map in different modes (2D, 3D and oblique)
 * @param {Object} configJs The config.js file.
 * @returns {void}
 */
export function createMaps (configJs) {
    create3DMap(configJs);
    createObliqueMap(configJs);
}
