import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {getLayerModelsByAttributes} from "../../../layers/RadioBridge";

export default {
    /**
     * Adds a layer to the map.
     * Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
     * @returns {void}
     */
    addLayer ({dispatch}, layer) {
        layer.setZIndex(mapCollection.getMap("2D").getLayers().getLength());
        // mapCollection.getMap("2D").addLayer(layer);

        dispatch("setLayersAlwaysOnTop", mapCollection.getMap("2D").getLayers());
    },
    /**
     * Pushes layers with the attribute: "alwaysOnTop" to the top of the layer collection.
     * @param {Object} _ the store context object (not used)
     * @param {module:ol/Collection~Collection} layers Layer Collection.
     * @returns {void}
     */
    setLayersAlwaysOnTop (_, layers) {
        layers.forEach(layer => {
            if (layer.get("alwaysOnTop") === true) {
                layer.setZIndex(getLayerModelsByAttributes({type: "layer"}).length);
            }
        });
    },
    /**
     * Adds a layer with a zIndex to the map.
     * If the layer already exists, only the zIndex of the layer will be reset.
     * Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} payload parameter object.
     * @param {module:ol/layer/Base~BaseLayer} payload.layer The layer to add.
     * @param {Number} payload.zIndex The zIndex of the layer.
     * @returns {void}
     */
    addLayerToIndex ({dispatch}, {layer, zIndex}) {
        layer.setZIndex(zIndex);
        if (!mapCollection.getMap("2D").getLayers().getArray().includes(layer)) {
            dispatch("addLayer", layer);
        }

        dispatch("setLayersAlwaysOnTop", mapCollection.getMap("2D").getLayers());
    },
    /**
     * Adds a layer on top of the map
     * Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
     * @returns {void}
     */
    addLayerOnTop ({dispatch}, layer) {
        dispatch("addLayerToIndex", {layer: layer, zIndex: getLayerModelsByAttributes({type: "layer"}).length});
    },

    /**
     * Checks if the layer with the given name already exists and uses it or creates a new layer and returns it if not.
     * @param {Object} context - A context object of the store instance.
     * @param {Function} context.dispatch - The dispatch function to call other actions.
     * @param {Object} context.getters - The getters of the map.
     * @param {Object} payload - The action payload.
     * @param {String} payload.layerName - The name of the new layer or the already existing layer.
     * @param {Boolean} [payload.alwaysOnTop=true] - Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @returns {module:ol/layer/Base~BaseLaye} The found layer or a new layer with the given name.
     */
    async addNewLayerIfNotExists ({dispatch, getters}, {layerName, alwaysOnTop = true}) {
        let resultLayer = await getters.getLayerByName(layerName);

        if (!resultLayer) {
            resultLayer = new VectorLayer({
                id: layerName,
                name: layerName,
                source: new VectorSource(),
                alwaysOnTop: alwaysOnTop
            });

            dispatch("addLayer", resultLayer);
        }

        return resultLayer;
    },
    /**
     * Verifies if all features of a given layerId are loaded
     * and waits if the layer has not been loaded previously
     *
     * @param {String} layerId - the layer ID to check loaded status
     *
     * @return {Promise} Resolves if the given Layer is fully loaded
     */
    async areLayerFeaturesLoaded ({commit, state}, layerId) {
        await new Promise(resolve => {
            if (state.loadedLayers.find(id => id === layerId)) {
                resolve();
            }
            const channel = Radio.channel("VectorLayer");

            channel.on({"featuresLoaded": id => {
                commit("addLoadedLayerId", id);
                if (id === layerId) {
                    resolve();
                }
            }});
        });
    }
};
