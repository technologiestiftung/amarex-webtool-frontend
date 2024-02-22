import Layer from "./layer";
// import * as bridge from "./RadioBridge.js";
// import getNestedValues from "../../utils/getNestedValues";
// import {wmts} from "@masterportal/masterportalapi";

/**
 * Creates a layer of type WMTS.
 * infoFormat="text/xml Format of provided information."
 * supported=["2D", "3D"] Supported map modes.
 * @param {Object} attrs  attributes of the layer
 * @param {Object} options  options of the layer
 * @returns {void}
 */
export default function WMTSLayer (attrs, options) {
    const defaults = {
        // infoFormat: "text/xml",
        supported: ["2D", "3D"]
    };

    // this.layer = wmts.createLayer(Object.assign(defaults, attrs, options));

    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs, options), this.layer, !attrs.isChildLayer);
    // this.createLegend();

    if (this.get("isVisibleInMap")) {
        this.updateSource();
    }

}

