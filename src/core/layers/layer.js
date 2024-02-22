import store from "../../app-store/index.js";
import bridge from "./RadioBridge.js";
import deepCopy from "../../utils/deepCopy.js";
import axios from "axios";
import Cluster from "ol/source/Cluster";

/**
 * Creates a layer object to extend from.
 * @param {Object} attrs attributes of the layer
 * @param {ol.Layer} layer the new created layer
 * @param {Boolean} [initialize=true] to be set to false, if layer is no Child-Layer
 * @returns {void}
 */
export default function Layer(attrs, layer, initialize = true) {
    // const defaults = {
    //     hitTolerance: 0,
    //     isNeverVisibleInTree: false,
    //     isRemovable: false,
    //     isSelected: false,
    //     isSettingVisible: false,
    //     isVisibleInMap: false,
    //     layerInfoClicked: false,
    //     singleBaselayer: false,
    //     // legend: true,
    //     maxScale: "1000000000",
    //     minScale: "0",
    //     selectionIDX: 0,
    //     showSettings: true,
    //     styleable: false,
    //     supported: ["2D"],
    //     isOutOfRange: undefined,
    //     isSecured: false,
    //     domId: "layer-list-group-item-" + attrs.id,
    //     showTopicText: i18next.t("common:tree.showTopic"),
    //     removeTopicText: i18next.t("common:tree.removeTopicText"),
    //     changeClassDivisionText: i18next.t("common:tree.changeClassDivision"),
    //     transparencyText: i18next.t("common:tree.transparency"),
    //     increaseTransparencyText: i18next.t("common:tree.increaseTransparency"),
    //     reduceTransparencyText: i18next.t("common:tree.reduceTransparency"),
    //     removeLayerText: i18next.t("common:tree.removeLayer"),
    //     levelUpText: i18next.t("common:tree.levelUp"),
    //     levelDownText: i18next.t("common:tree.levelDown"),
    //     settingsText: i18next.t("common:tree.settings"),
    //     infosAndLegendText: i18next.t("common:tree.infosAndLegend"),
    //     filterIconText: i18next.t("common:tree.filterIconText"),
    //     isAutoRefreshing: false,
    //     intervalAutoRefresh: -1,
    //     isClustered: false,
    //     filterRefId: undefined,
    //     scaleText: "",
    //     renderer: "default"
    // };
    // this.layer = layer;
    // this.observersAutoRefresh = [];
    // this.attributes = {...Object.assign({}, this.layer.values_, defaults, attrs)};
    // this.id = attrs.id;
    // delete this.attributes.source;
    // if (initialize) {
    //     this.initialize(attrs);
    // }
    // else if (attrs.isSelected === true || store.getters.treeType === "light") {
    //     this.setIsVisibleInMap(attrs.isSelected);
    // }
    // this.setMinMaxResolutions();
    // this.checkForScale({scale: store.getters["Maps/scale"]});
    // this.registerInteractionMapViewListeners();
    // this.onMapModeChanged(this);
    // this.handleScaleRange();
    // bridge.onLanguageChanged(this);
    // this.changeLang();
    // if (typeof this.layer.getSource === "function") {
    //     this.layer.getSource()?.on("featuresloaderror", async function () {
    //         const url = this.attributes.url
    //         + "&service="
    //         + this.attributes.typ
    //         + "&version="
    //         + this.attributes.version
    //         + "&request=describeFeatureType";
    //         await this.errorHandling(await axios.get(url, {withCredentials: true})
    //             .catch(function (error) {
    //                 return error.toJSON().status;
    //             }), this.get("name"));
    //     }.bind(this));
    //     this.layer.getSource()?.on("tileloaderror", async function (evt) {
    //         await this.errorHandling(await axios.get(evt.tile.src_, {withCredentials: true})
    //             .catch(function (error) {
    //                 return error.toJSON().status;
    //             }), this.get("name"));
    //     }.bind(this));
    //     this.layer.getSource()?.on("imageloaderror", async function (evt) {
    //         await this.errorHandling(await axios.get(evt.image.src_, {withCredentials: true})
    //             .catch(function (error) {
    //                 return error.toJSON().status;
    //             }), this.get("name"));
    //     }.bind(this));
    // }
}
/**
 * Initalizes the layer. Sets property singleBaselayer and sets the layer visible, if selected in attributes or treetype light.
 * @param {Object} attrs attributes of the layer
 * @returns {void}
 */
Layer.prototype.initialize = function (attrs) {
    // if (store.state.configJson?.Portalconfig.singleBaselayer !== undefined) {
    //     this.set("singleBaselayer", store.state.configJson?.Portalconfig.singleBaselayer);
    // }
    // if (attrs.clusterDistance) {
    //     this.set("isClustered", true);
    // }
    // this.updateLayerTransparency();
    // if (attrs.isSelected === true || store.getters.treeType === "light") {
    //     this.setIsVisibleInMap(attrs.isSelected);
    //     if (attrs.isSelected) {
    //         this.setIsSelected(attrs.isSelected);
    //         bridge.layerVisibilityChanged(this, attrs.isSelected);
    //     }
    //     this.set("isRemovable", store.state.configJson?.Portalconfig.layersRemovable);
    // }
    // else {
    //     this.layer.setVisible(false);
    // }
};

// };
/**
 * To be overwritten, does nothing.
 * @returns {void}
 */
Layer.prototype.createLayer = function () {
    // do in children
    console.warn(
        "function Layer.createLayer must be overwritten in extended layers!"
    );
};

/**
 * Register interaction with map view. Listens to change of scale.
 * @returns {void}
 */
Layer.prototype.registerInteractionMapViewListeners = function () {};
/**
 * Sets this layers to visible, if it supports the map mode else sets the visibility to false.
 * @returns {void}
 */
Layer.prototype.onMapModeChanged = function () {};
/**
 * Setter for ol/layer.setMaxResolution
 * @param {Number} value Maximum resolution of layer
 * @returns {void}
 */
Layer.prototype.setMaxResolution = function (value) {};
/**
 * Setter for ol/layer.setMinResolution
 * @param {Number} value Minimum resolution of layer
 * @returns {void}
 */
Layer.prototype.setMinResolution = function (value) {};
/**
 * Removes the layer from the map and the collection
 * @returns {void}
 */
Layer.prototype.removeLayer = function () {};
/**
 * Toggles the attribute isSelected. Calls Function setIsSelected.
 * @returns {void}
 */
Layer.prototype.toggleIsSelected = function () {};

/**
 * Setter for isVisibleInMap and setter for layer.setVisible
 * @param {Boolean} newValue Flag if layer is visible in map
 * @returns {void}
 */
Layer.prototype.setIsVisibleInMap = function (newValue) {};
/**
 * Setter for transparency and setter for opacitiy of the layer.
 * @param {Number} newValue Tranparency in percent
 * @returns {void}
 */
Layer.prototype.setTransparency = function (newValue) {};
/**
 * Decreases layer transparency by 10 percent
 * @return {void}
 */
Layer.prototype.decTransparency = function () {};
/**
 * Increases layer transparency by 10 percent.
 * @return {void}
 */
Layer.prototype.incTransparency = function () {};
/**
 * Transforms transparency into opacity and sets opacity on layer.
 * @return {void}
 */
Layer.prototype.updateLayerTransparency = function () {};
/**
 * Setter for isVisibleInTree
 * @param {Boolean} newValue flag if layer is visible in tree
 * @returns {void}
 */
Layer.prototype.setIsVisibleInTree = function (newValue) {
    this.set("isVisibleInTree", newValue);
    bridge.isVisibleInTreeChanged();
};
/**
 * Resets selectionIDX property; 0 is defined as initial value and the layer will be acknowledged as
 * newly added for the sake of initial positioning
 * @returns {void}
 */
Layer.prototype.resetSelectionIDX = function () {
    this.setSelectionIDX(0);
};
/**
 * Setter for selectionIDX
 * @param {String} newValue the selectionIDX
 * @returns {void}
 */
Layer.prototype.setSelectionIDX = function (newValue) {
    this.set("selectionIDX", parseInt(newValue, 10));
};
/**
 * Setter for isSettingVisible
 * @param {Boolean} newValue flag if layer settings are visible
 * @returns {void}
 */
Layer.prototype.setIsSettingVisible = function (newValue) {
    this.set("isSettingVisible", newValue);
};
/**
 * Setter for layerInfoChecked
 * @param {Boolean} newValue flag if layer info is checked
 * @returns {void}
 */
Layer.prototype.setLayerInfoChecked = function (newValue) {
    this.set("layerInfoChecked", newValue);
};
/**
 * Toggles the attribute isSettingVisible. Sets the settings of all other layers to invisible.
 * @return {void}
 */
Layer.prototype.toggleIsSettingVisible = function () {};
/**
 * Sets the attribute isSelected and sets the layers visibility. If newValue is false, the layer is removed from map.
 * If configured and the layer is a baseLayer, the other selected baseLayers are deselected.
 * @param {Boolean} newValue true, if layer is selected
 * @returns {void}
 */
Layer.prototype.setIsSelected = function (newValue) {};
/**
 * Toggles the attribute isVisibleInMap. If is true, the layer is set visible.
 * @return {void}
 */
Layer.prototype.toggleIsVisibleInMap = function () {};
/**
 * Refresh layerSource when updated,
 * e.g. needed because wmts source is created asynchronously.
 * @returns {void}
 */
Layer.prototype.updateLayerSource = function () {};
/**
 * Creates and starts an interval to refresh the layer and clears running interval.
 * @param {Boolean} isLayerSelected param to check if layer is selected
 * @param {Number} autoRefresh the interval in ms
 * @returns {void}
 */
Layer.prototype.activateAutoRefresh = function (
    isLayerSelected,
    autoRefresh
) {};
/**
 * Sets the once event for 'featuresloadend'.
 * Calls existing observers and passes the features of the given layer.
 * @param {Layer} layer the layer
 * @returns {void}
 */
Layer.prototype.setAutoRefreshEvent = function (layer) {};

/**
 * creates the text for the scale part in the layer tooltip
 * @returns {void}
 */
Layer.prototype.handleScaleRange = function () {
    if (store?.getters?.portalConfig?.tree?.showScaleTooltip) {
        const maxScale = this.attributes.maxScale,
            minScale = this.attributes.minScale,
            minScaleText = minScale === "0" ? "1:1" : "1:" + minScale,
            maxScaleText = "1:" + maxScale,
            scaleRange = minScaleText + " - " + maxScaleText,
            scaleText = i18next.t("common:tree.scaleText") + scaleRange;

        this.attributes.scaleText = scaleText;
    }
};

/**
 * Change language - sets default values for the language
 * @returns {void}
 */
Layer.prototype.changeLang = function () {};
/**
 * Calls Collection function moveModelDown
 * @return {void}
 */
Layer.prototype.moveDown = function () {
    bridge.moveModelInTree(this, -1);
};
/**
 * Calls Collection function moveModelUp
 * @return {void}
 */
Layer.prototype.moveUp = function () {};
/**
 * Called from setSelected, handles singleBaseLayer.
 * @param {Boolean} isSelected true, if layer is selected
 * @param {ol.Layer} layer the dedicated layer
 * @returns {void}
 */
function handleSingleBaseLayer(isSelected, layer) {
    const id = layer.get("id"),
        layerGroup = bridge.getLayerModelsByAttributes({
            parentId: layer.get("parentId"),
        }),
        singleBaselayer =
            layer.get("singleBaselayer") && layer.get("isBaseLayer") === true;

    if (isSelected) {
        if (singleBaselayer) {
            const map2D = mapCollection.getMap("2D");

            layerGroup.forEach((aLayer) => {
                // folders parentId is baselayer too, but they have not a function checkForScale
                if (
                    aLayer.get("id") !== id &&
                    typeof aLayer.checkForScale === "function"
                ) {
                    aLayer.set("isSelected", false);
                    aLayer.set("isVisibleInMap", false);
                    if (aLayer.get("layer") !== undefined) {
                        aLayer.get("layer").setVisible(false);
                    }
                    map2D?.removeLayer(aLayer.get("layer"));
                    // This makes sure that the Oblique Layer, if present in the layerList, is not selectable if switching between baseLayers
                    aLayer.checkForScale({
                        scale: store.getters["Maps/scale"],
                    });
                }
            });
            bridge.renderMenu();
        }
    }
}

/**
 * Called from setSelected or modelList, handles single time layers.
 * @param {Boolean} isSelected true, if layer is selected
 * @param {ol.Layer} layer the dedicated layer
 * @param {Object} model the dedicated model from modelList
 * @returns {void}
 */
export function handleSingleTimeLayer(isSelected, layer, model) {
    const selectedLayers = bridge.getLayerModelsByAttributes({
            isSelected: true,
            type: "layer",
            typ: "WMS",
        }),
        id = layer?.get("id") || model.id,
        timeLayer = layer || selectedLayers.find((it) => it.id === id),
        isTimeLayer = timeLayer?.get("typ") === "WMS" && timeLayer?.get("time");

    if (isTimeLayer) {
        if (isSelected) {
            const map2D = mapCollection.getMap("2D");

            selectedLayers.forEach((sLayer) => {
                if (sLayer.get("time") && sLayer.get("id") !== id) {
                    if (
                        sLayer
                            .get("id")
                            .endsWith(store.getters["WmsTime/layerAppendix"])
                    ) {
                        sLayer.removeLayer(sLayer.get("id"));
                    } else {
                        map2D?.removeLayer(sLayer.get("layer"));
                        sLayer.set("isSelected", false);
                    }
                }
            });

            store.commit("WmsTime/setTimeSliderActive", {
                active: true,
                currentLayerId: timeLayer.get("id"),
                playbackDelay: timeLayer?.get("time")?.playbackDelay || 1,
            });

            store.commit("WmsTime/setTimeSliderDefaultValue", {
                currentLayerId: timeLayer.get("id"),
            });

            store.commit("WmsTime/setVisibility", true);
        } else {
            timeLayer.removeLayer(timeLayer.get("id"));
        }
    }
}

/**
 * Setter for style of ol layer.
 * @param {Object} value The style to set at ol layer. If value is null, undefined is set as style at layer to use defaultStyle.
 * @returns {void}
 */
Layer.prototype.setStyle = function (value) {
    const style = value === null ? undefined : value;

    this.set("style", style);
    this.layer?.setStyle(style);
};
/**
 * Setter for isJustAdded (currently only used in uiStyle = table)
 * @param {Boolean} value Flag if layer has just been added to the tree
 * @returns {void}
 */
Layer.prototype.setIsJustAdded = function (value) {
    this.set("isJustAdded", value);
};

/**
 * Toggles the matching filter. filterRefId is used as reference.
 * @returns {void}
 */
Layer.prototype.toggleFilter = function () {
    const id = this.get("filterRefId");

    if (typeof id === "number") {
        store.dispatch(
            "Tools/Filter/jumpToFilter",
            { filterId: id },
            { root: true }
        );
    }
};

/**
 * Initiates the presentation of layer information.
 * @returns {void}
 */
Layer.prototype.showLayerInformation = function () {};

/**
 * Setter for legend, commits the legend to vue store using "Legend/setLegendOnChanged"
 * @param {String} value legend
 * @returns {void}
 */
Layer.prototype.setLegend = function (value) {
    this.set("legend", value);
    store.dispatch("Legend/setLegendOnChanged", value);
};
/**
 * Set observer for autoRefresh interval.
 * @param {Function} handler the handler to execute on autoRefresh of the layer
 * @returns {void}
 */
Layer.prototype.setObserverAutoInterval = function (handler) {
    this.observersAutoRefresh.push(handler);
};
/**
 * Sets visible min and max resolution on layer.
 * @returns {void}
 */
Layer.prototype.setMinMaxResolutions = function () {};
/**
 * Triggers event if vector features are loaded
 * @param {String} layerId id of the layer
 * @param {ol.Feature[]} features Loaded vector features
 * @fires Layer#RadioTriggerVectorLayerFeaturesLoaded
 * @return {void}
 */
Layer.prototype.featuresLoaded = function (layerId, features) {};

/**
 * Get layers as array.
 * @returns {Layer[]} layer as array
 */
Layer.prototype.getLayers = function () {
    const layer = this.layer;

    return [layer];
};

// NOTICE: backbone-relevant functions, may be removed if all layers are no longer backbone models.
// But set, get and has may stay, because they are convenient:)
Layer.prototype.set = function (arg1, arg2) {
    if (typeof arg1 === "object") {
        Object.keys(arg1).forEach((key) => {
            if (key === "isSelected") {
                this.setIsSelected(arg1[key]);
            } else if (key === "transparency") {
                this.setTransparency(arg1[key]);
            } else {
                this.attributes[key] = arg1[key];
            }
        }, this);
    } else if (typeof arg1 === "string") {
        if (arg1 === "isSelected") {
            this.setIsSelected(arg2);
        } else {
            this.attributes[arg1] = arg2;
        }
    }
};

Layer.prototype.get = function (key) {
    if (key === "layer") {
        return this.layer;
    } else if (key === "layerSource") {
        if (this.attributes.typ === "GROUP") {
            return this.attributes.layerSource;
        }
        return this.layer.getSource();
    }
    return this.attributes[key];
};

Layer.prototype.has = function (key) {
    if (key === "layer") {
        return this.layer !== undefined;
    } else if (key === "layerSource") {
        if (this.attributes.typ === "GROUP") {
            return this.attributes.layerSource !== undefined;
        }
        return this.layer.getSource() !== undefined;
    }
    return this.attributes[key] !== undefined;
};

Layer.prototype.getLayerStatesArray = function () {
    return this.layer.getLayerStatesArray();
};

Layer.prototype.toJSON = function () {
    const atts = { ...this.attributes };

    delete atts.layerSource;
    delete atts.layers;
    delete atts.collection;
    delete atts.options;

    return deepCopy(atts);
};

Layer.prototype.on = function () {
    // do nothing
};
Layer.prototype.off = function () {
    // do nothing
};
Layer.prototype.removeEventListener = function () {
    // do nothing
};
Layer.prototype.addEventListener = function () {
    // do nothing
};
Layer.prototype.trigger = function () {
    // do nothing
};
Layer.prototype.prepareLayerObject = function () {
    // do nothing
};
Layer.prototype.updateSource = function () {
    // do nothing
};
Layer.prototype.setIsActive = function () {
    // do nothing
};

