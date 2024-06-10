import { createStore } from "vuex";

import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import state from "./state";

import Addons from "../../addons/addons_3_0_0/addons-store/indexAddons";
import Maps from "../core/maps/store/indexMaps";
import Alerting from "../modules/alerting/store/indexAlerting";
import Controls from "../modules/controls/controls-store/indexControls";
import Menu from "../modules/menu/menu-store/indexMenu";
import Modules from "../modules/modules-store/indexModules";

const store = createStore({
  state,
  getters,
  mutations,
  actions,
  modules: {
    Alerting,
    Controls,
    Maps,
    Menu,
    Modules,
    Addons,
  },
});

export default store;

