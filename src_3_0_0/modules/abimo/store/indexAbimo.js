import getters from "./gettersAbimo";
import mutations from "./mutationsAbimo";
import actions from "./actionsAbimo";
import state from "./stateAbimo";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
