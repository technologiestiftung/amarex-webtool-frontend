import state from "./stateAppFileImport";
import actions from "./actionsAppFileImport";
import getters from "./gettersAppFileImport";
import mutations from "./mutationsAppFileImport";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
