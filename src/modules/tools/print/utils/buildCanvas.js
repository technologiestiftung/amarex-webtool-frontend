import {Group} from "ol/layer.js";

const CanvasModel = {
    /**
     * Getting the canvas layer for the print mask
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @returns {Object} - LayerObject for print mask.
     */
    getCanvasLayer: function (layerList) {
        const currentResolution = Radio.request("MapView", "getOptions")?.resolution,
            canvasLayerList = [];
        //     canvasLayer = {};

        layerList.forEach(layer => {
            if (layer instanceof Group) {
                layer.getLayers().getArray().forEach(childLayer => {
                    canvasLayerList.push(this.buildCanvasLayerType(childLayer, currentResolution));
                });
            }
            else {
                // canvasLayerList.push(this.buildCanvasLayerType(layer, currentResolution));
            }
        });

        // canvasLayerList = canvasLayerList.reverse();

        // for (const layer of canvasLayerList) {
        //     if (typeof layer !== "undefined") {
        //         canvasLayer = layer;
        //         break;
        //     }
        // }

        // return canvasLayer;
    }
};

export default CanvasModel;
