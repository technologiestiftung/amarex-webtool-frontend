
const mutations = {
    /**
     * Sets the layers with a mouseHoverField to the state
     * @param {Object} state Context state object.
     * @returns {Array} array of all layers with a mouseHoverFild property
     */
    setMouseHoverLayers: (state) => {
        state.mouseHoverLayers = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}).flatMap(layer => {
            if (layer.typ === "GROUP") {
                return layer.children.filter(childLayer => childLayer?.mouseHoverField && childLayer.mouseHoverField !== "");
            }
            // return layer?.mouseHoverField && layer.mouseHoverField !== "" ? [layer] : [];
        });
    },
    /**
     * Sets the mouseHoverInfos of each layer to the state
     * @param {Object} state Context state object.
     * @returns {Array} array of all layers object with their id and mouseHoverField information
     */
    setMouseHoverInfos: (state) => {
        state.mouseHoverInfos = state.mouseHoverLayers.map(layer => {
            if (layer.typ === "GROUP") {
                layer.children.forEach(childLayer => {
                    return {id: childLayer.id, mouseHoverField: childLayer.mouseHoverField};
                });
            }
            // return {id: layer.id, mouseHoverField: layer.mouseHoverField};
        });
    }
};

export default mutations;
