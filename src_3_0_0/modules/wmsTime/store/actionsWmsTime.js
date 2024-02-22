import getPosition from "../utils/getPosition";
import {getRenderPixel} from "ol/render";
import layerCollection from "../../../core/layers/js/layerCollection";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";
import store from "../../../app-store";

export default {
    windowWidthChanged ({commit, dispatch, state, getters}) {
        commit("setWindowWidth");

        if (!getters.minWidth && state.layerSwiper.active) {
            dispatch("toggleSwiper", state.timeSlider.currentLayerId + state.layerAppendix);
        }
    },
    /**
     * Watch the visible layers in layerConfig.
     * Starts and ends wmsTime when time layer is activated/deactivated
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.rootGetters the rootGetters
     * @returns {void}
     */
    watchVisibleLayerConfig ({commit, state, rootGetters}) {
        rootGetters.visibleLayerConfigs.forEach(visLayer => {
            if (visLayer.typ === "WMS" && visLayer.time) {
                commit("setTimeSliderActive", {
                    active: true,
                    currentLayerId: visLayer.id,
                    playbackDelay: visLayer.time?.playbackDelay || 1
                });
                commit("setTimeSliderDefaultValue", {
                    currentLayerId: visLayer.id
                });
                commit("setVisibility", true);
            }
        });
        store.watch((_, getters) => getters.visibleLayerConfigs, layerConfig => {
            if (!state.timeSlider.active) {
                layerConfig.forEach(element => {
                    if (element.typ === "WMS" && element.time) {
                        commit("setTimeSliderActive", {
                            active: true,
                            currentLayerId: element.id,
                            playbackDelay: element.time?.playbackDelay || 1
                        });
                        commit("setTimeSliderDefaultValue", {
                            currentLayerId: element.id
                        });
                        commit("setVisibility", true);
                    }
                });
            }
            else if (state.timeSlider.active) {
                let currentLayerConf = rootGetters.layerConfigById(state.timeSlider.currentLayerId),
                    visLayerConf = layerConfig.find(layerConf => layerConf.id === currentLayerConf.id);

                if (state.layerSwiper.targetLayer) {
                    currentLayerConf = rootGetters.layerConfigById(state.layerSwiper.targetLayer.get("id"));
                    visLayerConf = layerConfig.find(layerConf => layerConf.id === currentLayerConf.id);
                }
                if (!visLayerConf) {
                    commit("setTimeSliderActive", {
                        active: false,
                        currentLayerId: "",
                        objects: [],
                        playbackDelay: 1,
                        playing: false
                    });
                    commit("setVisibility", false);
                    commit("setTimeSliderDefaultValue", {
                        currentLayerId: ""
                    });
                }
            }
        }, {deep: true});
    },
    /**
     * Toggles the LayerSwiper.
     * If the LayerSwiper is deactivated, the second layer is deactivated and removed from the ModelList.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.dispatch the dispatch
     * @param {String} id Id of the Layer that should be toggled.
     * @returns {void}
     */
    async toggleSwiper ({commit, state, dispatch}, id) {
        commit("setLayerSwiperActive", !state.layerSwiper.active);

        const secondId = id.endsWith(state.layerAppendix) ? id : id + state.layerAppendix,
            layerId = state.layerSwiper.active ? id : secondId,
            layer = layerCollection.getLayerById(layerId);

        if (state.layerSwiper.active) {
            const {name, time, url, level, layers, version, parentId, gfiAttributes, featureCount} = layer.attributes;

            commit("setLayerSwiperSourceLayer", layer);

            if (!layerCollection.getLayerById(secondId)) {
                await dispatch("addLayerToLayerConfig", {
                    layerConfig: {
                        id: secondId,
                        name: name + "_second",
                        showInLayerTree: true,
                        typ: "WMS",
                        type: "layer",
                        visibility: true,
                        time,
                        url,
                        level,
                        layers,
                        version,
                        parentId,
                        legendURL: "ignore",
                        gfiAttributes: gfiAttributes,
                        featureCount: featureCount
                    },
                    parentKey: treeSubjectsKey
                }, {root: true});
            }
            else {
                dispatch("replaceByIdInLayerConfig", {
                    layerConfigs: [{
                        id: secondId,
                        layer: {
                            id: secondId,
                            visibility: true,
                            showInLayerTree: true
                        }
                    }]
                }, {root: true});
            }

            commit("setLayerSwiperTargetLayer", layerCollection.getLayerById(secondId));
        }
        else {

            // If the button of the "original" window is clicked, it is assumed, that the time value selected in the added window is desired to be further displayed.
            if (!id.endsWith(state.layerAppendix)) {
                const {TIME} = layer.getLayerSource().params_,
                    {transparency} = layer.attributes,
                    origLayer = layerCollection.getLayerById(id);

                origLayer.updateTime(id, TIME);

                dispatch("replaceByIdInLayerConfig", {
                    layerConfigs: [{
                        id: id,
                        layer: {
                            id: id,
                            transparency: transparency
                        }
                    }]
                }, {root: true});
                commit("setTimeSliderDefaultValue", TIME);
            }
            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: secondId,
                    layer: {
                        id: secondId,
                        visibility: false,
                        showInLayerTree: false
                    }
                }]
            }, {root: true});

            commit("setLayerSwiperSourceLayer", null);
            commit("setLayerSwiperTargetLayer", null);
        }
    },
    /**
     * Sets the postion of the layerSwiper to state according to the x-coordinate of the mousedown event
     * or adjusts it based on the direction of the key pressed by the state defined value.
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.commit the commit
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.getters the getters
     * @param {KeyboardEvent.keydown | MouseEvent.mousemove} event DOM Event.
     * @returns {void}
     */
    moveSwiper ({state, commit, dispatch, getters}, event) {
        const position = getPosition(event, state.layerSwiper.valueX, getters.currentTimeSliderObject.keyboardMovement);

        commit("setLayerSwiperValueX", position);
        commit("setLayerSwiperStyleLeft", position);
        dispatch("updateMap");
    },
    /**
     * Updates the map so that the layer is displayed clipped again.
     *
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.rootGetters the rootGetters
     * @param {Object} context.dispatch the dispatch
     * @returns {void}
     */
    async updateMap ({state, rootGetters, dispatch}) {
        if (!state.timeSlider.playing) {
            await mapCollection.getMap(rootGetters["Maps/mode"]).render();
        }

        state.layerSwiper.targetLayer?.getLayer().once("prerender", renderEvent => dispatch("drawLayer", renderEvent));
        state.layerSwiper.targetLayer?.getLayer().once("postrender", ({context}) => {
            context.restore();
        });

        state.layerSwiper.sourceLayer?.getLayer().once("prerender", renderEvent => dispatch("drawLayer", renderEvent));
        state.layerSwiper.sourceLayer?.getLayer().once("postrender", ({context}) => {
            context.restore();
            if (!state.layerSwiper.active) {
                mapCollection.getMap(rootGetters["Maps/mode"]).render();
            }
        });
    },
    /**
     * Manipulates the width of each layer according to the position of the layerSwiper and the side of the layer.
     *
     * @param {Object} context the vuex context
     * @param {Object} context.state the state
     * @param {Object} context.rootGetters the rootGetters
     * @param {ol.render.Event} renderEvent The event object triggered on prerender
     * @returns {void}
     */
    drawLayer ({state, rootGetters}, renderEvent) {
        const {context} = renderEvent,
            mapSize = mapCollection.getMap(rootGetters["Maps/mode"]).getSize(),
            isRightSided = renderEvent.target.get("id").endsWith(state.layerAppendix);

        // Clip everything that is to the other side of the swiper
        context.save();
        context.beginPath();
        context.moveTo(...getRenderPixel(renderEvent, isRightSided ? [state.layerSwiper.valueX, 0] : [0, 0]));
        context.lineTo(...getRenderPixel(renderEvent, isRightSided ? [state.layerSwiper.valueX, mapSize[1]] : [0, mapSize[1]]));
        context.lineTo(...getRenderPixel(renderEvent, isRightSided ? mapSize : [state.layerSwiper.valueX, mapSize[1]]));
        context.lineTo(...getRenderPixel(renderEvent, isRightSided ? [mapSize[0], 0] : [state.layerSwiper.valueX, 0]));
        context.closePath();
        context.clip();
    }
};
