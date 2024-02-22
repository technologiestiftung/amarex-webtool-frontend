export default {
    /**
     * if the tool is activated and there is a layout,
     * a callback function is registered to the postrender event of the map
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    togglePostrenderListener: function ({state, dispatch, commit}) {
        // const foundVectorTileLayers = [];

        // getVisibleLayer(state.printMapMarker);

        // /*
        // * Since MapFish 3 does not yet support VTL (see https://github.com/mapfish/mapfish-print/issues/659),
        // * they are filtered in the following code and an alert is shown to the user informing him about which
        // * layers will not be printed.
        // */
        // if (foundVectorTileLayers.length && state.active) {
        //     dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.print.vtlWarning"), {root: true});
        // }

        // commit("setVisibleLayer", state.visibleLayerList);

        // if (state.active && state.layoutList.length !== 0 && state.visibleLayerList.length >= 1 && state.eventListener === undefined) {
        //     const canvasLayer = Canvas.getCanvasLayer(state.visibleLayerList);

        //     commit("setEventListener", canvasLayer.on("postrender", evt => dispatch("createPrintMask", evt)));
        // }
        if (!state.active) {
            // dispatch("Maps/unregisterListener", {type: state.eventListener}, {root: true});
            // commit("setEventListener", undefined);
            if (state.invisibleLayer) {
                dispatch("setOriginalPrintLayer");
                commit("setHintInfo", "");
            }
        }
        // mapCollection.getMap("2D").render();
    },

    /**
     * Getting und showing the layer which is visible in map scale
     * @param {Object} param.state the state
     * @returns {void}
     */
    setOriginalPrintLayer: function ({state, rootGetters}) {
        const invisibleLayer = state.invisibleLayer,
            mapScale = state.currentMapScale,
            // eslint-disable-next-line new-cap
            resoByMaxScale = rootGetters["Maps/getResolutionByScale"](mapScale, "max"),
            // eslint-disable-next-line new-cap
            resoByMinScale = rootGetters["Maps/getResolutionByScale"](mapScale, "min");

        invisibleLayer.forEach(layer => {
            const layerModel = Radio.request("ModelList", "getModelByAttributes", {"id": layer.get("id")});

            if (resoByMaxScale <= layer.getMaxResolution() && resoByMinScale > layer.getMinResolution()) {
                layerModel.setIsOutOfRange(false);
            }
            else {
                layerModel.setIsOutOfRange(true);
            }
            layer.setVisible(true);

        });
    },

    /**
     * Getting und showing the layer which is visible in print scale
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {String} scale - the current print scale
     * @returns {void}
     */
    setPrintLayers: function ({state, rootGetters}, scale) {
        const visibleLayer = state.visibleLayerList,
            // eslint-disable-next-line new-cap
            resoByMaxScale = rootGetters["Maps/getResolutionByScale"](scale, "max"),
            // eslint-disable-next-line new-cap
            resoByMinScale = rootGetters["Maps/getResolutionByScale"](scale, "min"),
            invisibleLayer = [];

        // let invisibleLayerNames = "",
        //     hintInfo = "";

        visibleLayer.forEach(layer => {
            const layerModel = Radio.request("ModelList", "getModelByAttributes", {"id": layer.id});

            if (resoByMaxScale > layer.getMaxResolution() || resoByMinScale < layer.getMinResolution()) {
                invisibleLayer.push(layer);
                // invisibleLayerNames += "- " + layer.get("name") + "<br>";
                if (layerModel !== undefined) {
                    layerModel.setIsOutOfRange(true);
                }
            }
            else if (layerModel !== undefined) {
                layerModel.setIsOutOfRange(false);
            }
        });

        // hintInfo = i18next.t("common:modules.tools.print.invisibleLayer", {scale: "1: " + thousandsSeparator(scale, " ")});
        // hintInfo = hintInfo + "<br>" + invisibleLayerNames;

        // if (invisibleLayer.length && hintInfo !== state.hintInfo) {
        //     dispatch("Alerting/addSingleAlert", hintInfo, {root: true});
        //     commit("setHintInfo", hintInfo);
        // }

        // if (!invisibleLayer.length) {
        //     commit("setHintInfo", "");
        // }

        // commit("setInvisibleLayer", invisibleLayer);
    }
};
