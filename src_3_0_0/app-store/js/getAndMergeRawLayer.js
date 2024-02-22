import {rawLayerList} from "@masterportal/masterportalapi/src";
import omit from "../../shared/js/utils/omit";
import {updateProxyUrl} from "./getProxyUrl";
import layerFactory from "../../core/layers/js/layerFactory";

let zIndex = 1;

/**
 * Returns the extended raw layer to the id contained in the layer configuration.
 * If id contains an array of ids, the rawlayer is merged.
 * Grouped layers children are filled with the rawlayers.
 * @module app-store/js/getAndMergeRawLayer
 * @param {Object} layerConf configuration of layer like in the config.json
 * @param {Object} [showAllLayerInTree="false"] if true, all layers get the attribute showInLayerTree=true
 * @returns {Object} the extended and merged raw layer
 */
export function getAndMergeRawLayer (layerConf, showAllLayerInTree = false) {
    const rawLayer = mergeRawLayer(layerConf, rawLayerList.getLayerWhere({id: splitId(layerConf?.id)}));

    // use layerConf, if layer is not available in rawLayerList (services.json)
    return addAdditional(rawLayer || layerConf, showAllLayerInTree);
}

/**
 * Splits the id by seperator, if the id is a string.
 * @param {String} id The layer id.
 * @param {String} [seperator=#] The seperator to split by.
 * @returns {String} The first part of the id.
 */
function splitId (id, seperator = ".") {
    if (typeof id === "string") {
        return id.split(seperator)[0];
    }

    return id;
}

/**
 * Adds the attribute "showInLayerTree" to raw layer.
 * Rules:
 * If no add Layer Button is configured (portalConfig.tree.addLayerButton.active=true), then always showInLayerTree = true (so showLayerInTree has no effect in config.json)
 * If a layer has visibility= true, then also always showInLayerTree = true so it is not possible to have showInLayerTree = false and visibility: true
 * because visibility = true always results in showInLayerTree = true no matter what the config.json says.
 * If both are not true, then showInLayerTree = false (for all other treeTypes e.g. "auto") if the attribute is not already set explicitly on the layer (i.e. in config.json).
 * @param {Object} rawLayer The raw layer.
 * @param {Object} [showAllLayerInTree="false"] if true, all layers get the attribute showInLayerTree=true
 * @returns {Object} The raw layer
 */
export function addAdditional (rawLayer, showAllLayerInTree = false) {
    if (rawLayer) {
        const layerTypes3d = layerFactory.getLayerTypes3d();

        rawLayer.type = "layer";
        if (showAllLayerInTree || rawLayer.visibility) {
            rawLayer.showInLayerTree = true;
        }
        else if (!Object.prototype.hasOwnProperty.call(rawLayer, "showInLayerTree")) {
            rawLayer.showInLayerTree = false;
        }
        if (rawLayer.showInLayerTree === true) {
            rawLayer.zIndex = zIndex++;
        }
        rawLayer.is3DLayer = layerTypes3d.includes(rawLayer.typ?.toUpperCase());
    }

    return rawLayer;
}

/**
 * Returns the extended raw layer to the id contained in the layer configuration with updated proxy settings.
 * If id contains an array of ids, the rawlayer is merged.
 * Grouped layers children are filled with the rawlayers.
 * @param {Object} layerConf configuration of layer like in the config.json
 * @param {Object} rawLayer raw layer from services.json
 * @returns {Object} the extended and merged raw layer
 */
function mergeRawLayer (layerConf, rawLayer) {
    let mergedLayer;

    if (layerConf) {
        if (Array.isArray(layerConf.id)) {
            mergedLayer = mergeLayerWithSeveralIds(layerConf);
        }
        else if (layerConf.children) {
            mergedLayer = fillGroupLayer(layerConf);
        }
        else if (rawLayer !== undefined && rawLayer !== null) {
            mergedLayer = {...rawLayer, ...layerConf};
        }
    }

    if (mergedLayer?.useProxy === true) {
        updateProxyUrl(mergedLayer);
    }

    return mergedLayer;
}

/**
 * Fill the grouped layer configuration.
 * @param {Object} layerConf configuartion of layer like in the config.json
 * @returns {Object} the grouped layers children are filled with the rawlayers.
 */
function fillGroupLayer (layerConf) {
    // refactored from parserCustomTree.js, parseTree
    let rawLayer = {...layerConf};

    if (rawLayer?.children && typeof rawLayer.id === "string") {
        rawLayer.children = rawLayer.children.map(childLayer => {
            let objFromRawList = null;

            if (childLayer.styles && childLayer.styles[0]) {
                objFromRawList = rawLayerList.getLayerWhere({id: childLayer.id + childLayer.styles[0]});
            }
            if (objFromRawList === null || objFromRawList === undefined) {
                objFromRawList = rawLayerList.getLayerWhere({id: childLayer.id});
            }
            if (objFromRawList !== null && objFromRawList !== undefined) {
                return Object.assign(objFromRawList, childLayer);
            }
            console.error("A layer of the group \"" + rawLayer.name + "\" with id: " + childLayer.id + " was not created. Id not contained in services.json.");
            return undefined;
        });

        rawLayer.children = rawLayer.children.filter(function (childLayer) {
            return childLayer !== undefined;
        });

        if (rawLayer.children.length > 0) {
            rawLayer = Object.assign(rawLayer, {typ: "GROUP"});
        }
        return rawLayer;
    }
    return undefined;
}

/**
 * Merges layer configuration with ids property of type array.
 * @param {Object} layerConf configuartion of layer like in the config.json with ids in an array
 * @returns {Object|undefined} the merged raw layer or undefined if layer cannot be merged
 */
function mergeLayerWithSeveralIds (layerConf) {
    // refactored from parser.js, mergeexistingLayers and parserCustomTree.js, parseTree
    const ids = layerConf.id,
        existingLayers = [],
        maxScales = [],
        minScales = [];
    let mergedLayer = {};

    ids?.forEach(id => {
        const layer = rawLayerList.getLayerWhere({id: splitId(id)});

        if (layer) {
            existingLayers.push(layer);
        }
        else {
            console.warn("Layer with id ", id, " not found in services.json. Layers will no be merged!");
        }
    });
    if (existingLayers.length !== ids.length || ids.length === 0) {
        return undefined;
    }
    mergedLayer = {...existingLayers[0]};
    mergedLayer.layers = existingLayers.map(value => value.layers).toString();
    existingLayers.forEach(object => {
        maxScales.push(parseInt(object.maxScale, 10));
        minScales.push(parseInt(object.minScale, 10));
    });
    mergedLayer.maxScale = Math.max(...maxScales);
    mergedLayer.minScale = Math.min(...minScales);
    // sets all attributes from config at merged layer besides id-array
    mergedLayer = Object.assign(mergedLayer, omit(layerConf, ["id"], false));

    return mergedLayer;
}

/**
 * Returns all layer to add to states layerConfig for treetype 'auto'.
 * Filters the raw layerlist by typ and datasets.
 * Creates new raw layer if datasets contains more than one entry.
 * Filters and merges layerList by config parameters from portalConfig.tree 'layerIDsToIgnore', 'metaIDsToIgnore', 'metaIDsToMerge' and 'layerIDsToStyle'.
 * Layers with ids contained in 'layerIDsToIgnore'are removed from list.
 * Layers with meta_ids contained in 'metaIDsToIgnore'are removed from list.
 * Layers with meta_ids contained in 'metaIDsToMerge'are are merged to one layer.
 * Properties in 'layerIDsToStyle'are are assigned to dedicated layers. If an entry has more than one style, new layers are created for each style.
 * Ids are composed by origin id and styles value.
 * @param  {Object[]} [treeConfig={}] - portalConfig.tree from state, may contain 'layerIDsToIgnore', 'metaIDsToIgnore', 'metaIDsToMerge' and 'layerIDsToStyle',
 * If config 'validLayerTypes' is set, it contains layer types to be used with the tree.type 'auto'. If not configured,  ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"] are used.
 * @param {Boolean} [showLayerAddButton=false] if true, a button to add layer is shown
 * @returns {Array} the filtered layer configurations
 */
export function getAndMergeAllRawLayers (treeConfig = {}, showLayerAddButton = false) {
    // refactored from parserDefaultTree.js and layerList.js
    const layerList = rawLayerList.getLayerList(),
        rawLayers = [],
        validLayerTypes = treeConfig.validLayerTypesAutoTree || ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"],
        layerIDsToIgnore = treeConfig.layerIDsToIgnore || [],
        metaIDsToIgnore = treeConfig.metaIDsToIgnore || [],
        metaIDsToMerge = treeConfig.metaIDsToMerge || [],
        layerIDsToStyle = treeConfig.layerIDsToStyle || [],
        idsOfLayersToStyle = layerIDsToStyle.map(entry => entry.id),
        toMergeByMdId = {};
    let relatedWMSLayerIds = [];

    for (let i = 0; i < layerList.length; i++) {
        const rawLayer = addAdditional(layerList[i], !showLayerAddButton),
            layerType = rawLayer.typ?.toUpperCase();

        if (!validLayerTypes.includes(layerType) ||
            !rawLayer.datasets ||
            rawLayer.datasets.length === 0 ||
            layerIDsToIgnore.includes(rawLayer.id) ||
            metaIDsToIgnore.includes(rawLayer.datasets[0].md_id)) {
            continue;
        }
        if (metaIDsToMerge.includes(rawLayer.datasets[0].md_id)) {
            collectLayersToMergeByMetaId(toMergeByMdId, rawLayer.datasets[0].md_id, rawLayer);
            continue;
        }
        if (idsOfLayersToStyle.includes(rawLayer.id)) {
            styleAndMergeLayers(layerIDsToStyle, rawLayer, rawLayers);
            continue;
        }
        if (layerType === "SENSORTHINGS" && rawLayer.related_wms_layers !== undefined) {
            relatedWMSLayerIds = relatedWMSLayerIds.concat(rawLayer.related_wms_layers);
        }
        if (rawLayer.datasets.length > 1) {
            rawLayer.datasets.forEach((ds, index) => {
                const newLayer = {...rawLayer};

                newLayer.id = rawLayer.id + "_" + index;
                newLayer.datasets = [ds];
                rawLayers.push(newLayer);
            });
        }
        else {
            rawLayers.push(rawLayer);
        }
    }
    mergeByMetaIds(toMergeByMdId, rawLayers);
    removeFromLayerList(relatedWMSLayerIds, rawLayers);
    return rawLayers;
}

/**
 * Removes the layers with the given ids from rawLayers.
 * @param  {Object[]} [ids=[]] containing the ids of all layers to remove
 * @param  {Object[]} [layerList=[]] The layers from services.json
 * @returns {Object[]} LayerList without layers with the given ids
 */
function removeFromLayerList (ids = [], layerList = []) {
    ids.forEach(id => {
        const index = layerList.findIndex((layer) => layer.id === id);

        if (index > -1) {
            layerList.splice(index, 1);
        }
    });
}
/**
 * Properties in 'layerIDsToStyle'are are assigned to dedicated layers. If an entry has more than one style, new layers are created for each style.
 * Ids are composed by origin id and styles value.
 * @param  {Array} layerIDsToStyle contains style configurations
 * @param  {Object} layer raw layer from services.json
 * @param  {Object[]} [layerList=[]] The layers from services.json
 * @returns {void}
 */
function styleAndMergeLayers (layerIDsToStyle, layer, layerList) {
    const styleConfig = layerIDsToStyle.find(item => item.id === layer.id),
        rawLayer = Object.assign(layer, styleConfig);

    if (rawLayer.typ === "WMS" && Array.isArray(rawLayer.styles) && rawLayer.styles.length > 1) {
        rawLayer.styles.forEach(function (style, index) {
            const cloneObj = Object.assign({}, rawLayer);

            cloneObj.style = style;
            cloneObj.legendURL = rawLayer.legendURL[index];
            cloneObj.name = rawLayer.name[index];
            cloneObj.id = rawLayer.id + rawLayer.styles[index];
            cloneObj.styles = rawLayer.styles[index];
            layerList.push(cloneObj);
        });
    }
    else {
        layerList.push(rawLayer);
    }
}
/**
 * Collects layers to merge by metaId.
 * @param {Object} toMergeByMdId key contains metaId and value contains an Array of layers with same metaId
 * @param  {String} mdId metaId of the layers first dataset
 * @param {Object} rawLayer raw layer from services.json
 * @returns {void}
 */
function collectLayersToMergeByMetaId (toMergeByMdId, mdId, rawLayer) {
    if (!Array.isArray(toMergeByMdId[mdId])) {
        toMergeByMdId[mdId] = [];
    }
    toMergeByMdId[mdId].push(rawLayer);
}

/**
 * Adds configured attributes from the config.js parameter 'layerIDsToStyle' to the objects via the Id.
 * From layers with multiple styles, a new layer is created per style and added to layerList.
 * @param {Object} toMergeByMdId key contains metaId and value contains an Array of layers with same metaId
 * @param  {Object[]} [layerList=[]] The layers from services.json
 * @returns {void}
 */
function mergeByMetaIds (toMergeByMdId, layerList) {
    Object.values(toMergeByMdId).forEach(layers => {
        const layersContent = [];
        let gfiAttributesSet = false,
            maxScale,
            minScale,
            mergedLayer = null;

        layers.forEach((layer, index) => {
            if (index === 0) {
                mergedLayer = Object.assign({}, layer);
                mergedLayer.name = layer.datasets[0].md_name;
                maxScale = layer.maxScale;
                minScale = layer.minScale;
            }
            if (layer.gfiAttributes !== "ignore" && !gfiAttributesSet) {
                mergedLayer.gfiAttributes = layer.gfiAttributes;
                gfiAttributesSet = true;
            }
            layersContent.push(layer.layers);
            maxScale = Math.max(maxScale, layer.maxScale);
            minScale = Math.min(minScale, layer.minScale);
        });
        mergedLayer.layers = layersContent.join(",");
        mergedLayer.maxScale = maxScale;
        mergedLayer.minScale = minScale;
        layerList.push(mergedLayer);
    });
}

/**
 * Resets the zIndex to 0.
 * @returns {void}
 */
export function resetZIndex () {
    zIndex = 1;
}
