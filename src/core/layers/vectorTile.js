import Layer from "./layer";
import store from "../../app-store";

/**
 * Creates a layer of type vectorTile.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function VectorTileLayer (attrs) {
    const defaults = {
            selectedStyleID: undefined,
            useMpFonts: true,
            useProxy: false
        },
        mapEPSG = store.getters["Maps/projection"].getCode(),
        vtEPSG = attrs.epsg || mapEPSG;

    if (mapEPSG !== vtEPSG) {
        // console.warn(`VT Layer ${attrs.name}: Map (${mapEPSG}) and layer (${vtEPSG}) projection mismatch. View will be erroneous.`);
        attrs.isNeverVisibleInTree = true;
    }
    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);

    // set the style only at the first selection of the layer
    if (attrs.visibility) {
        this.setConfiguredLayerStyle();
    }
    else {
        this.layer.once("change:visible", () => this.setConfiguredLayerStyle());
    }
}

// Link prototypes and add prototype methods, means VTL uses all methods and properties of Layer
VectorTileLayer.prototype = Object.create(Layer.prototype);
