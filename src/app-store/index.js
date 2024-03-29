import Vue from "vue";
import Vuex from "vuex";

import Alerting from "../modules/alerting/store/indexAlerting";
import ConfirmAction from "../modules/confirmAction/store/indexConfirmAction";
import PortalFooter from "../modules/portalFooter/store/indexPortalFooter";
import GraphicalSelect from "../share-components/graphicalSelect/store/indexGraphicalSelect";
import Language from "../modules/language/store/indexLanguage";
import LayerInformation from "../modules/layerInformation/store/indexLayerInformation";
import LayerSelector from "../modules/layerSelector/store/indexLayerSelector";
import Legend from "../modules/legend/store/indexLegend";
import MapMarker from "../modules/mapMarker/store/indexMapMarker";
import MouseHover from "../modules/mouseHover/store/indexMouseHover";
import QuickHelp from "../modules/quickHelp/store/indexQuickHelp";
import PortalTitle from "../modules/portalTitle/store/indexPortalTitle";
import WmsTime from "../modules/wmsTime/store/indexWmsTime";

import getters from "./getters";
import mutations from "./mutations";
import state from "./state";
import actions from "./actions";

import controlsModule from "../modules/controls/indexControls";
import toolsModule from "../modules/tools/indexTools";

import ZoomTo from "../utils/zoomTo/store/indexZoomTo";

import isMobile from "../utils/isMobile";

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        Alerting,
        ConfirmAction,
        PortalFooter,
        GraphicalSelect,
        Language,
        LayerInformation,
        LayerSelector,
        Legend,
        MapMarker,
        MouseHover,
        QuickHelp,
        PortalTitle,
        WmsTime,
        controls: {
            ...controlsModule
        },
        ZoomTo,
        Tools: {
            ...toolsModule
        }
    },
    state,
    mutations,
    getters,
    actions
});

store.commit("setStore", store);

export default store;

// TODO supposed to allow hot reloading vuex getters/mutations without reloading MP - doesn't work for some reason
// copied without thought from admintool, so maybe I'm missing a parameter somewhere
/* istanbul ignore next */
if (module.hot) {
    module.hot.accept([
        "./getters",
        "./mutations"
    ], () => {
        // see https://vuex.vuejs.org/guide/hot-reload.html - need to do disable rule here
        /* eslint-disable global-require */
        const newGetters = require("./getters").default,
            newMutations = require("./mutations").default;
        /* eslint-enable global-require */

        store.hotUpdate({
            getters: newGetters,
            mutations: newMutations
        });
    });
}
