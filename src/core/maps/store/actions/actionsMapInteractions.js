export default {
    /**
     * Sets center and resolution to initial values.
     * @param {Object} param store context
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    resetView ({state, dispatch}) {
        // const view = getters.getView;

        if (state.mode === "3D") {
            dispatch("setZoomLevel", state.changeZoomLevel["3D"]);
            dispatch("setCenter", state.initialCenter);
        }
        else {
            // view.setCenter(state.initialCenter);
            // view.setResolution(state.initialResolution);
        }
        dispatch("MapMarker/removePointMarker", null, {root: true});
    },
    /**
     * Sets the Background for the Mapview.
     * @param {Object} param store context
     * @param {Object} param.getters the getters
     * @param  {string} value Image Url
     * @returns {void}
     */
    setBackground ({getters}, value) {
        const view = getters.getView;

        view.background = value;
    },

    /**
     * toggles the maps background
     * @param {Object} param store context
     * @param {Object} param.state the state
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @returns {void}
     */
    toggleBackground ({state, dispatch, getters}) {
        const view = getters.getView;

        if (view.background === "white") {
            dispatch("setBackground", state.backgroundImage);
            document.getElementById("map").style.background = `url(${state.backgroundImage}) repeat scroll 0 0 rgba(0, 0, 0, 0)`;
        }
        else {
            dispatch("setBackground", "white");
            document.getElementById("map").style.background = "white";
        }
    }
};
