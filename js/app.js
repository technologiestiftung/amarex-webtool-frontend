import loadAddons from "../src/addons";
import "../modules/restReader/RadioBridge";
import Autostarter from "../modules/core/autostarter";
import Util from "../modules/core/util";
import Preparser from "../modules/core/configLoader/preparser";
import MenuLoader from "../modules/menu/menuLoader";
import SliderView from "../modules/snippets/slider/view";
import SliderRangeView from "../modules/snippets/slider/range/view";
import WindowView from "../modules/window/view";
import SidebarView from "../modules/sidebar/view";
import ParcelSearchView from "../modules/tools/parcelSearch/view";

import {handleUrlParamsBeforeVueMount, readUrlParamEarly} from "../src/utils/parametricUrl/ParametricUrlBridge";
import {createMaps} from "../src/core/maps/maps.js";
import uiStyle from "../src/utils/uiStyle";
import store from "../src/app-store";

/**
 * WFSFeatureFilterView
 * @deprecated in 3.0.0
 */
import WFSFeatureFilterView from "../modules/wfsFeatureFilter/view";
/**
 * ExtendedFilterView
 * @deprecated in 3.0.0
 */
import ExtendedFilterView from "../modules/tools/extendedFilter/view";
import TreeFilterView from "../modules/treeFilter/view";
// controls
import ControlsView from "../modules/controls/view";
import SearchbarView from "../modules/searchbar/view";
import Button3DView from "../modules/controls/button3d/view";
import Orientation3DView from "../modules/controls/orientation3d/view";

let sbconfig,
    controls,
    controlsView;


/**
 * load the configuration of master portal
 * @return {void}.
 */
async function loadApp () {
    /* eslint-disable no-undef */
    const // legacyAddons = Object.is(ADDONS, {}) ? {} : ADDONS,
        utilConfig = {},
        style = uiStyle.getUiStyle(),
        // vueI18Next = initiateVueI18Next(),
        // instantiate Vue with Vuetify Plugin if the "vuetify" flag is set in the config.js
        // returns undefined if not
        // vuetify = await instantiateVuetify();

        /* eslint-disable no-undef */
        app = {};
    let searchbarAttributes = {};
    // styleGetters = {};

    if (Object.prototype.hasOwnProperty.call(Config, "uiStyle")) {
        utilConfig.uiStyle = Config.uiStyle.toUpperCase();
    }
    if (Object.prototype.hasOwnProperty.call(Config, "proxyHost")) {
        utilConfig.proxyHost = Config.proxyHost;
    }
    if (Object.prototype.hasOwnProperty.call(Config, "proxy")) {
        utilConfig.proxy = Config.proxy;
    }

    // import and register Vue addons according the config.js
    await loadAddons(Config.addons);

    await store.dispatch("loadConfigJs", Config);

    // must be done here, else it is done too late
    readUrlParamEarly();


    // Core laden
    new Autostarter();
    new Util(utilConfig);
    if (store.state.urlParams?.uiStyle) {
        uiStyle.setUiStyle(store.state.urlParams?.uiStyle);
    }
    else if (utilConfig.uiStyle) {
        uiStyle.setUiStyle(utilConfig.uiStyle);
    }

    // Pass null to create an empty Collection with options
    new Preparser(null, {url: Config.portalConf});
    handleUrlParamsBeforeVueMount(window.location.search);

    // styleGetters = {
    //     mapMarkerPointStyleId: store.getters["MapMarker/pointStyleId"],
    //     mapMarkerPolygonStyleId: store.getters["MapMarker/polygonStyleId"],
    //     highlightFeaturesPointStyleId: store.getters["HighlightFeatures/pointStyleId"],
    //     highlightFeaturesPolygonStyleId: store.getters["HighlightFeatures/polygonStyleId"],
    //     highlightFeaturesLineStyleId: store.getters["HighlightFeatures/lineStyleId"]
    // };

    // styleList.initializeStyleList(styleGetters, Config, Radio.request("Parser", "getItemsByAttributes", {type: "layer"}), Radio.request("Parser", "getItemsByAttributes", {type: "tool"}),
    //     (initializedStyleList, error) => {
    //         if (error) {
    //             Radio.trigger("Alert", "alert", {
    //                 text: "<strong>Die Datei '" + Config.styleConf + "' konnte nicht geladen werden!</strong>",
    //                 kategorie: "alert-warning"
    //             });
    //         }
    //         return initializedStyleList;
    //     });
    createMaps(Config, Radio.request("Parser", "getPortalConfig").mapView);
    new WindowView();

    app.$mount();

    new MenuLoader();

    if (Object.prototype.hasOwnProperty.call(Config, "zoomTo")) {
        store.commit("ZoomTo/setConfig", Config.zoomTo);
    }
    // NOTE: When using these deprecated parameters, the two url parameters can't be used in conjunction
    if (Object.prototype.hasOwnProperty.call(Config, "zoomToFeature")) {
        console.warn("The configuration parameter 'zoomToFeature' is deprecated in v3.0.0. Please use 'zoomTo' instead.");
        store.commit("ZoomTo/setConfig", {zoomToFeature: Config.zoomToFeature});
        store.commit("ZoomTo/setDeprecatedParameters", true);
    }
    if (Object.prototype.hasOwnProperty.call(Config, "zoomToGeometry")) {
        console.warn("The configuration parameter 'zoomToGeometry' is deprecated in v3.0.0. Please use 'zoomTo' instead.");
        store.commit("ZoomTo/setConfig", {zoomToGeometry: Config.zoomToGeometry});
        store.commit("ZoomTo/setDeprecatedParameters", true);
    }

    new SliderView();
    new SliderRangeView();

    // Module laden
    // Tools
    new SidebarView();

    Radio.request("ModelList", "getModelsByAttributes", {type: "tool"}).forEach(tool => {
        switch (tool.id) {
            case "parcelSearch": {
                new ParcelSearchView({model: tool});
                break;
            }
            /**
             * wfsFeatureFilter
             * @deprecated in 3.0.0
             */
            case "wfsFeatureFilter": {
                new WFSFeatureFilterView({model: tool});
                break;
            }
            /**
             * extendedFilter
             * @deprecated in 3.0.0
             */
            case "extendedFilter": {
                new ExtendedFilterView({model: tool});
                break;
            }
            case "treeFilter": {
                new TreeFilterView({model: tool});
                break;
            }
            default: {
                break;
            }
        }
    });

    if (!style || style !== "SIMPLE") {
        controls = Radio.request("Parser", "getItemsByAttributes", {type: "control"});
        controlsView = new ControlsView();

        controls.forEach(control => {
            let element;

            switch (control.id) {
                case "button3d": {
                    if (control.attr === true) {
                        if (global.Cesium === null) {
                            console.warn("Cesium/3D-Functionality could not be loaded - Please check your Cesium configuration");
                        }
                        else {
                            element = controlsView.addRowTR(control.id);
                            new Button3DView({el: element});
                        }
                    }
                    break;
                }
                case "orientation3d": {
                    if (control.attr === true) {
                        element = controlsView.addRowTR(control.id);
                        new Orientation3DView({el: element});
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    searchbarAttributes = Radio.request("Parser", "getItemsByAttributes", {type: "searchBar"})[0].attr;
    sbconfig = Object.assign({}, {quickHelp: store.getters.portalConfig?.quickHelp} || {});
    sbconfig = Object.assign(sbconfig, searchbarAttributes);

    if (searchbarAttributes !== undefined && sbconfig) {
        new SearchbarView(sbconfig);
    }
}

export {loadApp};
