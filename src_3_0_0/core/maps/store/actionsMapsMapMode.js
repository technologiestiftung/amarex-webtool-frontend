/**
 * Controls the exchange of the map. E.g. the change from 2D to 3D mode.
 */
export default {
    /**
     * Changes the map mode from 2D to 3D and vice versa.
     * @param {Object} param store context.
     * @param {Object} param.getters the getters.
     * @param {Object} param.dispatch the dispatch.
     * @param {String} targetMode The target map mode.
     * @returns {void}
     */
    changeMapMode ({getters, dispatch}, targetMode) {
        const currentMode = getters.mode;

        if (currentMode !== targetMode) {
            if (targetMode === "2D") {
                dispatch("registerMapListener");
                dispatch("activateMap2d");
            }
            else if (targetMode === "3D") {
                dispatch("unregisterMapListener");
                dispatch("activateMap3d");
            }
        }
    },

    /**
     * Activates the 2D map mode.
     * @param {Object} param store context.
     * @param {Object} param.commit the commit.
     * @returns {void}
     */
    activateMap2d ({commit}) {
        const map2dView = mapCollection.getMapView("2D"),
            map3d = mapCollection.getMap("3D");

        map2dView.animate({rotation: 0}, () => {
            map3d?.setEnabled(false);
            commit("setMode", "2D");
        });
    },

    /**
     * Activates the 3D map mode.
     * @param {Object} param store context.
     * @param {Object} param.commit the commit.
     * @param {Object} param.rootState the rootState.
     * @returns {void}
     */
    activateMap3d ({commit, rootState}) {
        const map3d = mapCollection.getMap("3D");

        if (map3d) {
            map3d.setEnabled(true);
            commit("setMode", "3D");
        }
        else {
            rootState.portalConfig.map.startingMapMode = "3D";
        }
    }
};
