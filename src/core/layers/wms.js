import { wms } from "@masterportal/masterportalapi";
import store from "../../app-store/index.js";
import Layer from "./layer.js";
import * as bridge from "./RadioBridge.js";
/**
 * Creates a layer of type WMS.
 * @param {Object} attrs Params of the raw layer.
 * @returns {void}
 */
export default function WMSLayer(attrs) {
    const defaults = {
        gfiAsNewWindow: null,
        supported: ["2D", "3D"],
        showSettings: true,
        extent: null,
        isSecured: false,
        useProxy: false,
    };

    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(
        this,
        Object.assign(defaults, attrs),
        this.layer,
        !attrs.isChildLayer
    );
    // this.createLegend();
    bridge.listenToChangeSLDBody(this);

    // Hack for services that do not support EPSG:4326
    if (this.get("notSupportedIn3D") === true) {
        this.set("supported", ["2D"]);
    }
}

/**
 * Gets raw layer attributes from services.json attributes.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Object} The raw layer attributes.
 */
WMSLayer.prototype.getRawLayerAttributes = function (attrs) {
    const rawLayerAttributes = {
        // id: attrs.id,
        // gutter: attrs.gutter,
        // format: attrs.format,
        // url: attrs.url,
        // tilesize: attrs.tilesize,
        // layers: attrs.layers,
        // version: attrs.version,
        olAttribution: attrs.olAttribution,
        // transparent: attrs.transparent?.toString(),
        // singleTile: attrs.singleTile,
        minScale: parseInt(attrs.minScale, 10),
        maxScale: parseInt(attrs.maxScale, 10),
        crossOrigin: attrs.crossOrigin,
        // crs: attrs.crs
    };

    // if (attrs.styles !== "nicht vorhanden") {
    //     rawLayerAttributes.STYLES = attrs.styles;
    // }

    return rawLayerAttributes;
};

/**
 * Gets additional layer params.
 * @param {Object} attrs Params of the raw layer.
 * @returns {Obeject} The layer params.
 */
WMSLayer.prototype.getLayerParams = function (attrs) {
    return {
        // layers: attrs.layers,
        // name: attrs.name,
        legendURL: attrs.legendURL,
        // gfiTheme: attrs.gfiTheme,
        // gfiAttributes: attrs.gfiAttributes,
        // infoFormat: attrs.infoFormat,
        // gfiAsNewWindow: attrs.gfiAsNewWindow,
        featureCount: attrs.featureCount,
        // format: attrs.format,
        useProxy: attrs.useProxy,
        // typ: attrs.typ,
        layerSequence: attrs.layerSequence,
    };
};

/**
 * Updates the SLDBody of the layer source.
 * @returns {void}
 */
WMSLayer.prototype.updateSourceSLDBody = function () {
    this.layer
        .getSource()
        .updateParams({
            SLD_BODY: this.get("SLDBody"),
            STYLES: this.get("paramStyle"),
        });
};
/**
 * Updates the layers source by changing the cache id.
 * @returns {void}
 */
WMSLayer.prototype.updateSource = function () {
    wms.updateSource(this.layer);
};

/**
 * Gets the gfi url from the layers source.
 * @returns {String} - The created getFeature info url.
 */
WMSLayer.prototype.getGfiUrl = function () {
    const mapView = mapCollection.getMapView("2D"),
        resolution = store.getters["Maps/resolution"],
        projection = mapView.getProjection(),
        coordinate = store.getters["Maps/clickCoordinate"];

    return this.get("layerSource").getFeatureInfoUrl(
        coordinate,
        resolution,
        projection,
        {
            INFO_FORMAT: this.get("infoFormat"),
            FEATURE_COUNT: this.get("featureCount"),
        }
    );
};
/**
 * If the parameter "legendURL" is empty, it is set to GetLegendGraphic.
 * @return {void}
 */
// WMSLayer.prototype.createLegend = function () {
//     const version = this.get("version");
//     let legend = this.get("legend");

//     /**
//     * @deprecated in 3.0.0
//     */
//     if (this.get("legendURL")) {
//         if (this.get("legendURL") === "") {
//             legend = true;
//         }
//         else if (this.get("legendURL") === "ignore") {
//             legend = false;
//         }
//         else {
//             legend = this.get("legendURL");
//         }
//     }

//     if (Array.isArray(legend)) {
//         this.setLegend(legend);
//     }
//     else if (legend === true && this.get("url")) {
//         const layerNames = this.get("layers").split(","),
//             legends = [];

//         // Compose GetLegendGraphic request(s)
//         layerNames.forEach(layerName => {
//             const legendUrl = new URL(this.get("url"));

//             legendUrl.searchParams.set("SERVICE", "WMS");
//             legendUrl.searchParams.set("VERSION", version);
//             legendUrl.searchParams.set("REQUEST", "GetLegendGraphic");
//             legendUrl.searchParams.set("FORMAT", "image/png");
//             legendUrl.searchParams.set("LAYER", layerName);

/**
 * Returns the extent, if available. Else returns the extent of the mapView.
 * @returns {Array} the extent
 */
WMSLayer.prototype.getExtent = function () {
    if (this.has("extent")) {
        return this.get("extent");
    }
    return store.getters["Maps/bbox"];
};

