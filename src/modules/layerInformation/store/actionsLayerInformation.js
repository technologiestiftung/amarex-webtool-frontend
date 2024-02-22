const actions = {
    /**
     * This sets additional layerInformations in case of group layers
     * @param {Object} param.commit the commit
     * @param {Object} additionalLayer the layerInformation for each other group layer
     * @returns {void}
     */
    setAdditionalLayer: function ({commit}, additionalLayer) {
        commit("setAdditionalLayer", additionalLayer);
    },

    /**
     * This sets the layerInformation active (needed in model.js and group.js)
     * @param {Object} param.commit the commit
     * @param {Object} active the active state
     * @returns {void}
     */
    activate: function ({commit}, active) {
        commit("setActive", active);
    },

    /**
     * This sets the layerInformation active (needed in model.js and group.js)
     * @param {Object} param.commit the commit
     * @param {Object} currentLayerName the layerName
     * @returns {void}
     */
    setCurrentLayerName: function ({commit}, currentLayerName) {
        commit("setCurrentLayerName", currentLayerName);
    },

    /**
     * if the user changes the layerInfo Abstract Text via the dropdown for the group layers
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {Object} chosenElementTitle the chosen Elementtitle, grouplayer, in the dropDown
     * @returns {void}
     */
    changeLayerInfo: async function ({dispatch, state}, chosenElementTitle) {
        let metaId = "",
            cswUrl = "",
            metaInfo = {},
            layer = "";
        const additionalLayer = state.additionalLayer;

        layer = additionalLayer.find(({layerName}) => layerName === chosenElementTitle);
        metaId = layer.metaID;
        cswUrl = layer.cswUrl;
        metaInfo = {metaId, cswUrl};

        dispatch("getAbstractInfo", metaInfo);
        dispatch("setMetadataURL", metaId);
    }
};

export default actions;
