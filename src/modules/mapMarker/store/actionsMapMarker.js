import {fetchFirstModuleConfig} from "../../../utils/fetchFirstModuleConfig";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import Point from "ol/geom/Point.js";
import Feature from "ol/Feature.js";

/**
 * @const {String} configPaths an array of possible config locations. First one found will be used
 * @const {Object} actions vue actions
 */
const configPaths = [
    "configJs.mapMarker"
];

export default {
    /**
     * Sets the config-params of this mapMarker into state.
     * @param {Object} context The context Vue instance.
     * @returns {Boolean} false, if config does not contain the mapMarker.
     */
    initialize: (context) => {
        if (context) {
            return fetchFirstModuleConfig(context, configPaths, "MapMarker", false);
        }
        return null;
    },

    /**
     * Creates a feature from the given geometry and adds it to the map.
     * @param {Object} store.getters - The Map Marker getters.
     * @param {Function} store.commit - Function to commit a mutation.
     * @param {Function} store.dispatch Function to dispatch an action.
     * @param {module:ol/geom/SimpleGeometry} geometry - The given geometry.
     * @returns {void}
     */
    placingPolygonMarkerByGeom ({state, commit, dispatch}, geometry) {
        const styleObject = styleList.returnStyleObject(state.polygonStyleId);

        dispatch("removePolygonMarker");

        if (styleObject && geometry) {
            const feature = new Feature({
                    geometry: geometry
                }),
                featureStyle = createStyle.createStyle(styleObject, feature, false, Config.wfsImgPath).getStyle();

            feature.setStyle(featureStyle);
            commit("addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
            commit("setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
            dispatch("Maps/addLayerOnTop", state.markerPolygon, {root: true});
        }
        else {
            dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.nostyleObject", {styleId: state.polygonStyleId}), {root: true});
        }
    }
};
