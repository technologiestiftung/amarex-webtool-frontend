const actions = {
    
    /**
     * Applies values from previous saved buffer analysis
     * that was copied into the URL.
     * @return {void}
     */
    applyValuesFromSavedUrlBuffer ({rootState, state, dispatch, commit}) {
        if (rootState.urlParams["Tools/bufferAnalysis/active"]) {
            const extractedParams = rootState.urlParams.initvalues.map((element) => {
                    return element.replace(/\\"/g, "\"").split(":")[1].replaceAll("\"", "").replaceAll("}", "");
                }),
                selectedSourceLayerFromUrl = state.selectOptions.find(layer => layer.id === extractedParams[0]),
                bufferRadiusFromUrl = extractedParams[1],
                resultTypeFromUrl = extractedParams[2],
                selectedTargetLayerFromUrl = state.selectOptions.find(layer => layer.id === extractedParams[3]);

            dispatch("applySelectedSourceLayer", selectedSourceLayerFromUrl);
            commit("setInputBufferRadius", bufferRadiusFromUrl);
            dispatch("applyBufferRadius", bufferRadiusFromUrl);
            commit("setResultType", resultTypeFromUrl);
            dispatch("applySelectedTargetLayer", selectedTargetLayerFromUrl);
        }
    }
};

export default actions;
