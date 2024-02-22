import actionsMapAttributesMapper from "./actionsMapAttributesMapper.js";
import actionsMapInteractions from "./actionsMapInteractions.js";
import actionsMapInteractionsZoomTo from "./actionsMapInteractionsZoomTo.js";
import actionsMapLayers from "./actionsMapLayers.js";
import actionsMapMode from "./actionsMapMode.js";
import findWhereJs from "../../../../utils/findWhereJs";
import api from "@masterportal/masterportalapi/src/maps/api";
import parseCesiumParameters from "../../../../utils/parseCesiumParameters";


export default {
    /**
     * @description initializes view listeners and sets store values
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @returns {void}
     */
    initView ({dispatch, getters}) {
        const mapView = getters.getView,
            params = findWhereJs(mapView.get("options"), {resolution: mapView.getConstrainedResolution(mapView.getResolution())});

        mapView.on("change:center", function () {
            Radio.trigger("MapView", "changedCenter", mapView.getCenter());
            Radio.trigger("RemoteInterface", "postMessage", {"centerPosition": mapView.getCenter()});
        });

        if (document.getElementById("map") !== null) {
            dispatch("setBackground", document.getElementById("map").style.backgroundImage);
        }

        // triggers the function checkForScale modules\core\modelList\layer\model.js
        Radio.trigger("MapView", "changedOptions", params);
    },

    /**
     * Creates the olcesium  3D map.
     * @param {Object} param.rootState the rootState.
     * @fires Core#RadioRequestMapGetMap
     * @returns {OLCesium} - ol cesium map.
     */
    createMap3D ({rootState}) {
        return api.map.createMap({
            cesiumParameter: parseCesiumParameters(rootState.urlParams),
            map2D: mapCollection.getMap("2D"),
            shadowTime: function () {
                return this.time || Cesium.JulianDate.fromDate(new Date());
            }
        }, "3D");
    },

    ...actionsMapAttributesMapper,
    ...actionsMapInteractions,
    ...actionsMapInteractionsZoomTo,
    ...actionsMapLayers,
    ...actionsMapMode
};
