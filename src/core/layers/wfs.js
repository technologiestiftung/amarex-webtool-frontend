import { wfs } from "@masterportal/masterportalapi";
import LoaderOverlay from "../../utils/loaderOverlay.js";
// import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
// import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
// import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
// import store from "../../app-store";
// import Layer from "./layer";
import * as bridge from "./RadioBridge.js";
import Cluster from "ol/source/Cluster";
// import {bbox, all} from "ol/loadingstrategy.js";

// const geometryTypeRequestLayers = [];

/**
 * Creates a layer of type WFS.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function WFSLayer(attrs) {
    // const defaults = {
    //     supported: ["2D", "3D"],
    //     showSettings: true,
    //     isSecured: false,
    //     altitudeMode: "clampToGround",
    //     useProxy: false,
    //     sourceUpdated: false
    // };

    // this.createLayer(Object.assign(defaults, attrs));

    // override class methods for webgl rendering
    // has to happen before setStyle/styling
    if (attrs.renderer === "webgl") {
        webgl.setLayerProperties(this);
    }

    // call the super-layer
    // Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    // this.set("style", this.getStyleFunction(attrs));
    // this.prepareFeaturesFor3D(this.layer.getSource().getFeatures());
}
// Link prototypes and add prototype methods, means WFSLayer uses all methods and properties of Layer
// WFSLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates a layer of type WFS by using wfs-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
WFSLayer.prototype.createLayer = function (attrs) {
    const rawLayerAttributes = {
            //     id: attrs.id,
            //     url: attrs.url,
            //     clusterDistance: attrs.clusterDistance,
            //     featureNS: attrs.featureNS,
            //     featureType: attrs.featureType,
            //     version: attrs.version
        },
        layerParams = {
            //     name: attrs.name,
            //     typ: attrs.typ,
            // gfiAttributes: attrs.gfiAttributes,
            // gfiTheme: attrs.gfiTheme,
            hitTolerance: attrs.hitTolerance,
            // altitudeMode: attrs.altitudeMode,
            alwaysOnTop: attrs.alwaysOnTop,
            layerSequence: attrs.layerSequence,
            renderer: attrs.renderer, // use "default" (canvas) or "webgl" renderer
            styleId: attrs.styleId, // styleId to pass to masterportalapi
            style: attrs.style, // style function to style the layer or WebGLPoints style syntax
            excludeTypesFromParsing: attrs.excludeTypesFromParsing, // types that should not be parsed from strings, only necessary for webgl
            isPointLayer: attrs.isPointLayer, // whether the source will only hold point data, only necessary for webgl
            gfiThemeSettings: attrs.gfiThemeSettings, // for accessing additional theme settings
        },
        // styleFn = this.getStyleFunction(attrs),
        options = {
            // doNotLoadInitially: attrs.doNotLoadInitially,
            // wfsFilter: attrs.wfsFilter,
            // clusterGeometryFunction: (feature) => {
            //     // do not cluster invisible features; can't rely on style since it will be null initially
            //     if (feature.get("hideInClustering") === true) {
            //         return null;
            //     }
            //     return feature.getGeometry();
            // },
            // featuresFilter: this.getFeaturesFilterFunction(attrs),
            // If an Object contains a property which holds a Function, the property is called a method.
            // This method, when called, will always have it's this variable set to the Object it is associated with.
            // This is true for both strict and non-strict modes.
            // therefore use [fn].bind(this)
            beforeLoading: function () {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            }.bind(this),
            afterLoading: function (features) {
                this.featuresLoaded(attrs.id, features);
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.hide();
                }
            }.bind(this),
            // onLoadingError: (error) => {
            //     console.error("masterportal wfs loading error:", error);
            // },
            // loadingParams: {
            //     xhrParameters: attrs.isSecured ? {credentials: "include"} : undefined,
            //     propertyname: this.getPropertyname(attrs) || undefined,
            //     // only used if loading strategy is all
            //     bbox: attrs.bboxGeometry ? attrs.bboxGeometry.getExtent().toString() : undefined
            // }
            // loadingStrategy: attrs.loadingStrategy === "all" ? all : bbox
        };

    // if (styleFn) {
    //     styleFn.bind(this);
    // }
    // options.style = styleFn;

    this.layer = wfs.createLayer(rawLayerAttributes, { layerParams, options });
};

/**
 * Updates the layers source by calling refresh at source. Depending on attribute 'sourceUpdated'.
 * @returns {void}
 */
WFSLayer.prototype.updateSource = function () {
    if (this.get("sourceUpdated") === false) {
        this.set("sourceUpdated", true);
        this.layer.getSource().refresh();
    }
};

/**
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
WFSLayer.prototype.hideAllFeatures = function () {
    const layerSource =
            this.get("layerSource") instanceof Cluster
                ? this.get("layerSource").getSource()
                : this.get("layerSource"),
        features = layerSource.getFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    features.forEach((feature) => {
        feature.set("hideInClustering", true);
        feature.setStyle(() => null);
    });

    layerSource.addFeatures(features);
};
/**
 * Shows all features by setting their style.
 * @returns {void}
 */
WFSLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach((feature) => {
        const style = this.getStyleAsFunction(this.get("style"));

        feature.setStyle(style(feature));
    });
};
/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
WFSLayer.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource =
            this.get("layerSource") instanceof Cluster
                ? this.get("layerSource").getSource()
                : this.get("layerSource"),
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map((id) =>
            layerSource.getFeatureById(id)
        );

    this.hideAllFeatures();
    featuresToShow.forEach((feature) => {
        const style = this.getStyleAsFunction(this.get("style"));

        if (feature && feature !== null) {
            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }
    });

    layerSource.addFeatures(allLayerFeatures);
    bridge.resetVectorLayerFeatures(this.get("id"), allLayerFeatures);
};
/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
WFSLayer.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }

    return function () {
        return style;
    };
};
/**
 * Sets Style for layer.
 * @returns {void}
 */
WFSLayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};

