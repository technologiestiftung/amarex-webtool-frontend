import getters from "./gettersControls";
import mutations from "./mutationsControls";
import OverviewMap from "./overviewMap/components/OverviewMap.vue";


/**
 * controls-Module is required to be able to nest controls
 * in the store as ["controls", controlName].
 * Also holds information on control components and allows
 * addons to register themselves via mutation.
 */
export default {
    namespaced: true,
    modules: {
    },
    // initial state - information on all controls that are not addons.
    state: {
        overviewMap: OverviewMap,
        bottomControls: ["attributions", "overviewMap"]
    },
    mutations,
    getters
};
