import state from "./stateProjectUploader";
import actions from "./actionsProjectUploader";
import mutations from "./mutationsProjectUploader";
import getters from "./gettersProjectUploader";

export default {
  namespaced: true, // mandatory
  state,
  actions,
  getters,
  mutations
};

