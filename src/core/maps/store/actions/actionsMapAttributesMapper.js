/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import store from "../../../../app-store";

export default {
    /**
     * Sets the map to the store. As a side-effect, map-related functions are registered
     * to fire changes when required. Each time a new map is registered, all old listeners
     * are discarded and new ones are registered.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootState the rootState
     * @param {module:ol/Map} map map object
     * @returns {void}
     */
    async setMapAttributes ({commit, dispatch, rootState}, {map}) {
        // dispatch("registerListener", {type: "change:size", listener: "setSize", listenerType: "commit"});
        // dispatch("registerListener", {type: "pointermove", listener: "updatePointer", listenerType: "dispatch"});
        // dispatch("registerListener", {type: "moveend", listener: "updateAttributes", listenerType: "dispatch"});
        // dispatch("registerListener", {type: "click", listener: "updateClick", listenerType: "dispatch"});

        if (rootState.configJson.Portalconfig.mapView?.twoFingerPan) {
            const mapDiv = document.getElementById("map");

            mapDiv.addEventListener("touchmove", (event) => dispatch("oneFingerDragMessage", event));
            mapDiv.addEventListener("touchend", (event) => dispatch("oneFingerDragMessageEnd", event));
        }

        // dispatch("setViewAttributes", map.getView());

        const layerIds = await dispatch("normalizeLayers", await map.getLayers().getArray()),
            channel = Radio.channel("VectorLayer");

        // listen to featuresLoaded event to be able to determine if all features of a layer are completely loaded
        channel.on({"featuresLoaded": id => {
            commit("addLoadedLayerId", id);
            if (rootState.urlParams["Maps/highlightFeature"]) {
                dispatch("highlightFeature", {type: "viaLayerIdAndFeatureId", layerIdAndFeatureId: rootState.urlParams["Maps/highlightFeature"]});
            }
        }});

        // commit("setMode", map.mode);
        // update state once initially to get initial settings
        // dispatch("updateAttributes", {map: map});
        commit("setLayerIds", layerIds[1]);
    },

    /**
     * Setter for 3D map attribute "shadowTime".
     * @param {Object} state store state
     * @param {Cesium.JulianDate} time Shadow time in julian date format.
     * @returns {void}
     */
    setShadowTime (state, time) {
        mapCollection.getMap("3D").time = time;
    },

    /**
     * Sets mapView values to the store.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {module:ol/MapView} mapView map object
     * @returns {void}
     */
    setViewAttributes ({commit}, mapView) {
        // currently has no change mechanism
        // commit("setProjection", mapView.getProjection());
        commit("setBackgroundImage", mapView.get("backgroundImage"));
        // note initial values for quick comparisons/resets
        // commit("setInitialZoomLevel", mapView.getZoom());
        // commit("setInitialCenter", mapView.getCenter());
        commit("setInitialResolution", mapView.getResolution());
        commit("setZoom", mapView.getZoom());
        // commit("setMinZoomLevel", mapView.getMinZoom());
        // commit("setMaxZoomLevel", mapView.getMaxZoom());
    },

    /**
     * Updates map attributes.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.getters the getters
     * @param {Object} param.dispatch the dispatch
     * @param {MapBrowserEvent} evt - Moveend event
     * @returns {Function} update function for state parts to update onmoveend
     */
    updateAttributes ({commit, getters, dispatch}, evt) {
        // let map;

        // if (evt) {
        //     map = evt.map;
        // }
        // else {
        //     ({map} = getters);
        // }

        // const mapView = map.getView();

        // commit("setResolution", mapView.getResolution());
        // commit("setBoundingBox", mapView.calculateExtent(map.getSize()));
        commit("setRotation", mapView.getRotation());
        // commit("setZoom", mapView.getZoom());
        dispatch("setCenter", mapView.getCenter());
    },

    /**
     * Updates the click coordinate and the related pixel depending on the map mode.
     * If Gfi Tool is active, the features of this coordinate/pixel are set.
     * @param {Object} param store context
     * @param {Object} param.getters the getters
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {MapBrowserEvent} evt - Click event in 2D, fake click event in 3D
     * @returns {void}
     */
    updateClick ({getters, commit, dispatch, rootGetters}, evt) {
        // if (getters.mode === "2D" || getters.mode === "Oblique") {
        //     commit("setClickCoordinate", evt.coordinate);
        //     commit("setClickPixel", evt.pixel);
        // }
        // else {
        //     commit("setClickCoordinate", evt.pickedPosition);
        //     commit("setClickCartesianCoordinate", [evt.position.x, evt.position.y]);
        // }

        if (!rootGetters["controls/orientation/poiModeCurrentPositionEnabled"]) {
            dispatch("MapMarker/placingPointMarker", evt.coordinate, {root: true});
            commit("controls/orientation/setPosition", evt.coordinate, {root: true});
            commit("controls/orientation/setShowPoi", true, {root: true});
        }
    },

    /**
     * @typedef {Object} LayerData minimal implementation, more to come
     * @property {String} name layer name
     * @property {Boolean} visibility layer visibility
     * @property {Number} opacity layer opacity in [0, 1] range
     * @property {module:ol/layer} olLayer openlayers layer object kept for quick access
     */

    /**
     * Normalizes layer data of map for easy access.
     * @param {Object} state the state
     * @param {module:ol/Layer[]} layerArray array of layers of ol/Map
     * @returns {[object, LayerData[]]} returns layer byId and idList according to store normalization
     */
    normalizeLayers (state, layerArray) {
        const layers = {},
            layerIds = [];

        layerArray.forEach(layer => {
            const id = layer?.get("id");

            if (typeof id !== "undefined") {
                layerIds.push(id);
                layers[id] = {
                    name: layer.get("name") || "Unbenannter Layer",
                    visibility: layer.getVisible(),
                    opacity: layer.getOpacity(),
                    olLayer: layer
                };
            }
        });
        return [
            layers,
            layerIds
        ];
    },
    /**
     * Opens an alert Window to inform the user to use two fingers for panning
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Event} event touchstart
     * @returns {void}
    */
    oneFingerDragMessage ({state, commit}, event) {
        if (!event) {
            return;
        }

        if (event && event.targetTouches.length === 1 && !state.twoFingerPanStart) {
            store.dispatch("Alerting/addSingleAlert", i18next.t("common:mapRegion.twoFingerPanAlert"));
        }
        else if (event.targetTouches.length === 2) {
            commit("setTwoFingerPanStart", true);
        }
    },
    /**
     * Removes the touchmove and touchend event listeners added for the two finger pan alert message
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.commit the commit
     * @param {Element} mapDiv html element of the map
     * @param {Event} event touchend
     * @returns {void}
     */
    oneFingerDragMessageEnd ({dispatch, commit}, event) {
        if (!event) {
            return;
        }
        if (event.targetTouches?.length === 0) {
            commit("setTwoFingerPanStart", false);
        }

        const mapDiv = document.getElementById("map");

        mapDiv.removeEventListener("touchmove", dispatch("oneFingerDragMessage"));
        mapDiv.removeEventListener("touchend", dispatch("oneFingerDragMessageEnd"));
    }
};
