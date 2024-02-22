import {Vector} from "ol/layer.js";
import Cluster from "ol/source/Cluster";

/**
 * Interactions with the layers of the map.
 */
export default {
    /**
     * Adds a layer to the map.
     * @param {Object} _ context object.
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
     * @returns {void}
     */
    addLayer (_, layer) {
        const map2D = mapCollection.getMap("2D");

        if (!map2D.getLayers().getArray().includes(layer)) {
            if (layer.get("alwaysOnTop")) {
                layer.setZIndex(9999999);
            }
            map2D.addLayer(layer);
        }
        else {
            console.warn(`The layer with Id: ${layer.get("id")} was not added to the map, because the layer already exists!`);
        }
    },

    /**
     * Verifies if all features of a given layerId are loaded
     * and waits if the layer has not been loaded previously
     * @param {Object} _ - context object.
     * @param {String} layerId - the layer ID to check loaded status
     *
     * @return {Promise} Resolves if the given Layer is fully loaded
     */
    async areLayerFeaturesLoaded (_, layerId) {
        const map2D = mapCollection.getMap("2D"),
            layer = map2D.getLayers().getArray().find(singleLayer => singleLayer.get("id") === layerId);

        await new Promise(resolve => {
            if (layer instanceof Vector) {
                let layerSource = layer.getSource();

                if (layer.getSource() instanceof Cluster) {
                    layerSource = layerSource.getSource();
                }
                if (layerSource.getFeatures().length > 0) {
                    resolve();
                }
                else {
                    layerSource.once("featuresloadend", () => {
                        resolve();
                    });
                }
            }
        });
    },

    /**
     * Checks if a layer is in the map collections
     * @param {Object} _ context object.
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to check.
     * @returns {Boolean} if layer exists in mapCollection
     */
    checkLayer (_, layer) {
        const map2D = mapCollection.getMap("2D");

        if (map2D.getLayers().getArray().includes(layer)) {
            return true;
        }
        return false;
    }
};
