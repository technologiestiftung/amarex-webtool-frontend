import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import layerCollection from "../../layers/js/layerCollection";
import {nextTick} from "vue";

/**
 * Actions to highlight features.
 * @module core/maps/js/highlightFeature
 */

/**
 * Calls highlight function depending on highlightObject's type.
 * @param {Object} context the vuex context
 * @param {Object} context.commit the commit
 * @param {Object} context.dispatch the dispatch
 * @param {Object} param.getters the getters
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightFeature ({commit, dispatch}, highlightObject) {
    if (highlightObject.type === "increase") {
        increaseFeature(commit, highlightObject);
    }
    else if (highlightObject.type === "viaLayerIdAndFeatureId") {
        highlightViaParametricUrl(dispatch, highlightObject.layerIdAndFeatureId);
    }
    else if (highlightObject.type === "highlightPolygon") {
        highlightPolygon(commit, dispatch, highlightObject);
    }
    else if (highlightObject.type === "highlightMultiPolygon") {
        highlightMultiPolygon(commit, dispatch, highlightObject);
    }
    else if (highlightObject.type === "highlightLine") {
        highlightLine(commit, dispatch, highlightObject);
    }
}
/**
 * Highlights a polygon feature.
 * @param {Object} commit the commit
 * @param {Object} dispatch the dispatch
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature) : undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.fill?.color) {
                clonedStyle.getFill().setColor(newStyle.fill.color);
            }
            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            feature.setStyle(clonedStyle);
        }
    }
    else {
        dispatch("Maps/placingPolygonMarker", highlightObject.feature, {root: true});
    }

}
/** Highlights a multipolygon feature.
 * @param {Object} commit the commit
 * @param {Object} dispatch the dispatch
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightMultiPolygon (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature, false),
            clonedStyles = [];

        if (originalStyle) {
            for (let i = 0; i < originalStyle.length; i++) {
                commit("Maps/addHighlightedFeature", feature, {root: true});
                commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {
                    root: true
                });
                const clonedStyle = originalStyle[i].clone();

                if (newStyle.fill?.color) {
                    clonedStyle.getFill().setColor(newStyle.fill.color);
                }
                if (newStyle.stroke?.width) {
                    clonedStyle.getStroke().setWidth(newStyle.stroke.width);
                }
                if (newStyle.stroke?.color) {
                    clonedStyle.getStroke().setColor(newStyle.stroke.color);
                }
                clonedStyles.push(clonedStyle);
            }
            feature.setStyle(clonedStyles);
        }
    }
    else {
        dispatch("MapMarker/placingPolygonMarker", highlightObject.feature, {
            root: true
        });
    }
}
/**
 * Highlights a line feature.
 * @param {Object} commit the commit
 * @param {Object} dispatch the dispatch
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function highlightLine (commit, dispatch, highlightObject) {
    if (highlightObject.highlightStyle) {
        const newStyle = highlightObject.highlightStyle,
            feature = highlightObject.feature,
            originalStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature) : undefined;

        if (originalStyle) {
            const clonedStyle = Array.isArray(originalStyle) ? originalStyle[0].clone() : originalStyle.clone();

            commit("Maps/addHighlightedFeature", feature, {root: true});
            commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

            if (newStyle.stroke?.width) {
                clonedStyle.getStroke().setWidth(newStyle.stroke.width);
            }
            if (newStyle.stroke?.color) {
                clonedStyle.getStroke().setColor(newStyle.stroke.color);
            }
            feature.setStyle(clonedStyle);
        }
    }
    else {
        dispatch("Maps/placingPolygonMarker", highlightObject.feature, {root: true});
    }

}
/**
 * Highlights a feature via layerid and featureid.
 * @param {Object} dispatch the dispatch
 * @param {String[]} layerIdAndFeatureId contains layerid and featureid
 * @returns {void}
 */
async function highlightViaParametricUrl (dispatch, layerIdAndFeatureId) {
    if (layerIdAndFeatureId) {
        getHighlightFeature(layerIdAndFeatureId[0], layerIdAndFeatureId[1], dispatch);
    }
}
/**
 * Searches the feature which shall be hightlighted.
 * @param {String} layerId Id of the layer, containing the feature to hightlight
 * @param {String} featureId Id of feature which shall be hightlighted
 * @param {Object} dispatch the dispatch
 * @returns {ol/feature} feature to highlight
 */
function getHighlightFeature (layerId, featureId, dispatch) {
    let feature;

    nextTick(() => {
        const layerSource = layerCollection.getLayerById(layerId)?.layerSource;

        if (layerSource) {
            if (layerSource.getFeatures().length > 0) {
                feature = layerSource.getFeatureById(featureId)
                    || layerSource.getFeatures() // if feature clustered source find cluster the highlighted feature belongs to
                        .find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));

                if (feature && dispatch) {
                    dispatch("Maps/placingPolygonMarker", feature, {root: true});
                }
            }
            else {
                layerSource.once("featuresloadend", () => {
                    feature = layerSource.getFeatureById(featureId)
                        || layerSource.getFeatures() // if feature clustered source find cluster the highlighted feature belongs to
                            .find(feat => feat.get("features")?.find(feat_ => feat_.getId() === featureId));

                    if (feature && dispatch) {
                        dispatch("Maps/placingPolygonMarker", feature, {root: true});
                    }
                });
            }
        }

        return feature;
    });


}
/**
 * Increases the icon of the feature.
 * @param {Object} commit the commit
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @returns {void}
 */
function increaseFeature (commit, highlightObject) {
    const scaleFactor = highlightObject.scale ? highlightObject.scale : 1.5,
        feature = highlightObject.feature // given already
            ? highlightObject.feature
            : getHighlightFeature(highlightObject.layer?.id, highlightObject.id); // get feature from layersource, incl. check against clustered features
    let clonedStyle = styleObject(highlightObject, feature) ? styleObject(highlightObject, feature).clone() : null,
        clonedImage = null;

    if (!clonedStyle) {
        if (typeof feature.getStyle()?.clone === "function") {
            clonedStyle = feature.getStyle()?.clone();
        }
        else {
            clonedStyle = {...feature.getStyle()};
        }
    }
    clonedImage = clonedStyle && typeof clonedStyle.getImage === "function" ? clonedStyle.getImage() : undefined;

    if (clonedImage) {
        commit("Maps/addHighlightedFeature", feature, {root: true});
        commit("Maps/addHighlightedFeatureStyle", feature.getStyle(), {root: true});

        if (clonedStyle.getText()) {
            clonedStyle.getText().setScale(scaleFactor);
        }
        clonedImage.setScale(clonedImage.getScale() * scaleFactor);
        if (highlightObject?.highlightStyle?.fill && highlightObject?.highlightStyle?.fill?.color) {
            clonedImage.getFill().setColor(highlightObject.highlightStyle.fill.color);
        }
        feature.setStyle(clonedStyle);
    }
}

/**
 * Get style via styleList.
 * @param {Object} highlightObject contains several parameters for feature highlighting
 * @param {ol/feature} feature openlayers feature to highlight
 * @param {Boolean} [returnFirst = true] if true, returns the first found style, else all created styles
 * @returns {ol/style|Array} ol style
 */
function styleObject (highlightObject, feature, returnFirst = true) {
    const stylelistObject = highlightObject.styleId ? styleList.returnStyleObject(highlightObject.styleId) : styleList.returnStyleObject(highlightObject.layer.id);
    let style;

    if (stylelistObject !== undefined) {
        style = createStyle.createStyle(stylelistObject, feature, false, Config.wfsImgPath);
        if (returnFirst && Array.isArray(style) && style.length > 0) {
            style = style[0];
        }
    }
    return style;
}

export {highlightFeature};

