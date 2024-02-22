import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsLayerInformation";

const {startLayerInformation, additionalSingleLayerInfo, setMetadataURL} = actions;

describe("src_3_0_0/modules/layerInformation/store/actionsLayerInformation.js", () => {
    describe("initialize the store", () => {
        it("should initialize the LayerInformation", done => {
            const state = {
                    layerConf: {},
                    menuSide: "mainMenu",
                    name: "common:layerInformation",
                    type: "layerInformation"
                },
                layerConf = {
                    id: "123",
                    metaID: "layerMetaId",
                    layername: "name",
                    url: "google.de",
                    urlIsVisible: true,
                    datasets: [
                        {
                            md_id: "123",
                            md_name: "MDName"
                        }
                    ]
                },
                rootGetters = {
                    "Modules/Legend/layerInfoLegend": {
                        id: "123"
                    },
                    isMobile: false,
                    "Menu/expanded": () => true
                };

            testAction(startLayerInformation, layerConf, state, {}, [
                {type: "Menu/changeCurrentComponent", payload: {
                    type: "layerInformation",
                    side: "mainMenu",
                    props: {name: layerConf.datasets[0].md_name}
                }, dispatch: true},
                {type: "setLayerInfo", payload: layerConf},
                {type: "setMetadataURL", payload: layerConf.datasets[0].md_id, dispatch: true},
                {type: "additionalSingleLayerInfo", payload: undefined, dispatch: true}
            ], {}, done, rootGetters);
        });

        it("should hide the LayerInformation in menu", done => {
            const state = {
                    layerConf: {},
                    menuSide: "mainMenu",
                    name: "common:layerInformation",
                    type: "layerInformation"
                },
                layerConf = {
                    id: "123",
                    metaID: "layerMetaId",
                    attributes: null,
                    customMetadata: false,
                    layername: "name",
                    url: "google.de",
                    urlIsVisible: true,
                    datasets: [
                        {
                            md_id: "123"
                        }
                    ]
                },
                rootGetters = {
                    "Modules/Legend/layerInfoLegend": {
                        id: "123"
                    },
                    isMobile: false,
                    "Menu/expanded": () => true
                };

            testAction(startLayerInformation, layerConf, state, {}, [
                {type: "Menu/changeCurrentComponent", payload: {
                    type: "layerInformation",
                    side: "mainMenu",
                    props: {name: layerConf.datasets[0].md_name}
                }, dispatch: true},
                {type: "setLayerInfo", payload: layerConf},
                {type: "setMetadataURL", payload: layerConf.datasets[0].md_id, dispatch: true},
                {type: "additionalSingleLayerInfo", payload: undefined, dispatch: true}
            ], {}, done, rootGetters);
        });

        it("should open menu and show LayerInformation if mobile and menu is closed", done => {
            const state = {
                    layerConf: {},
                    menuSide: "mainMenu",
                    name: "common:layerInformation",
                    type: "layerInformation"
                },
                layerConf = {
                    id: "123",
                    metaID: "layerMetaId",
                    attributes: null,
                    customMetadata: false,
                    layername: "name",
                    url: "google.de",
                    urlIsVisible: true,
                    datasets: [
                        {
                            md_id: "123"
                        }
                    ]
                },
                rootGetters = {
                    "Modules/Legend/layerInfoLegend": {
                        id: "123"
                    },
                    isMobile: true,
                    "Menu/expanded": () => false
                };

            testAction(startLayerInformation, layerConf, state, {}, [
                {
                    type: "Menu/toggleMenu", payload: "mainMenu", dispatch: true
                },
                {type: "Menu/changeCurrentComponent", payload: {
                    type: "layerInformation",
                    side: "mainMenu",
                    props: {name: layerConf.datasets[0].md_name}
                }, dispatch: true},
                {type: "setLayerInfo", payload: layerConf},
                {type: "setMetadataURL", payload: layerConf.datasets[0].md_id, dispatch: true},
                {type: "additionalSingleLayerInfo", payload: undefined, dispatch: true}
            ], {}, done, rootGetters);
        });

        it("should not open menu and show LayerInformation if mobile and menu is open", done => {
            const state = {
                    layerConf: {},
                    menuSide: "mainMenu",
                    name: "common:layerInformation",
                    type: "layerInformation"
                },
                layerConf = {
                    id: "123",
                    metaID: "layerMetaId",
                    attributes: null,
                    customMetadata: false,
                    layername: "name",
                    url: "google.de",
                    urlIsVisible: true,
                    datasets: [
                        {
                            md_id: "123"
                        }
                    ]
                },
                rootGetters = {
                    "Modules/Legend/layerInfoLegend": {
                        id: "123"
                    },
                    isMobile: true,
                    "Menu/expanded": () => true
                };

            testAction(startLayerInformation, layerConf, state, {}, [
                {type: "Menu/changeCurrentComponent", payload: {
                    type: "layerInformation",
                    side: "mainMenu",
                    props: {name: layerConf.datasets[0].md_name}
                }, dispatch: true},
                {type: "setLayerInfo", payload: layerConf},
                {type: "setMetadataURL", payload: layerConf.datasets[0].md_id, dispatch: true},
                {type: "additionalSingleLayerInfo", payload: undefined, dispatch: true}
            ], {}, done, rootGetters);
        });

        it("should call createLegendForLayerInfo, if legend is not created for layer with given id", done => {
            const state = {
                    layerConf: {},
                    menuSide: "mainMenu",
                    name: "common:layerInformation",
                    type: "layerInformation"
                },
                layerConf = {
                    id: "123",
                    metaID: "layerMetaId",
                    attributes: null,
                    customMetadata: false,
                    layername: "name",
                    url: "google.de",
                    urlIsVisible: true,
                    datasets: [
                        {
                            md_id: "123"
                        }
                    ]
                },
                rootGetters = {
                    "Modules/Legend/layerInfoLegend": {
                        id: "124"
                    },
                    isMobile: false,
                    "Menu/expanded": () => true
                };

            testAction(startLayerInformation, layerConf, state, {}, [
                {
                    type: "Modules/Legend/setLayerInfoLegend", payload: {}
                },
                {
                    type: "Modules/Legend/createLegendForLayerInfo", payload: "123", dispatch: true
                },
                {type: "Menu/changeCurrentComponent", payload: {
                    type: "layerInformation",
                    side: "mainMenu",
                    props: {name: layerConf.datasets[0].md_name}
                }, dispatch: true},
                {type: "setLayerInfo", payload: layerConf},
                {type: "setMetadataURL", payload: layerConf.datasets[0].md_id, dispatch: true},
                {type: "additionalSingleLayerInfo", payload: undefined, dispatch: true}
            ], {}, done, rootGetters);
        });

        it("should initialize the other abstract layer infos", done => {
            const state = {
                layerInfo: {
                    cswUrl: "https://metaver.de/csw",
                    metaID: "73A344E9-CDB5-4A17-89C1-05E202989755"
                }
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done
            testAction(additionalSingleLayerInfo, null, state, {}, [
                {type: "getAbstractInfo", payload: {attributes: state.layerInfo.attributes, metaId: state.layerInfo.metaID, cswUrl: state.layerInfo.cswUrl, customMetadata: state.layerInfo.customMetadata}, dispatch: true}
            ], {}, done);

        });

        it("should set the Meta Data URLs", done => {
            const metaId = "73A344E9-CDB5-4A17-89C1-05E202989755",
                state = {
                    layerInfo: {
                        "id": "123",
                        "metaID": "layerMetaId",
                        "layername": "name",
                        "url": "google.de",
                        "urlIsVisible": true
                    },
                    metaDataCatalogueId: "2"
                },
                metaURLs = ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"];

            testAction(setMetadataURL, metaId, state, {}, [
                {type: "setMetaURLs", payload: metaURLs}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });

        });

        it("should use showDocUrl if set", done => {
            const state = {
                layerInfo: {
                    "id": "123",
                    "metaID": "73A344E9-CDB5-4A17-89C1-05E202989755",
                    "layername": "name",
                    "url": "google.de",
                    "urlIsVisible": true,
                    "cswUrl": "https://metaver.de/csw",
                    "showDocUrl": "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
                },
                metaDataCatalogueId: "2"
            };

            testAction(setMetadataURL, "73A344E9-CDB5-4A17-89C1-05E202989755", state, {}, [
                {type: "setMetaURLs", payload: ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"]}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });

        });

        it("should use the url from metaDataCatalogueId if showDocUrl is not set", done => {
            const state = {
                    layerInfo: {
                        "id": "123",
                        "metaID": "73A344E9-CDB5-4A17-89C1-05E202989755",
                        "layername": "name",
                        "url": "google.de",
                        "urlIsVisible": true,
                        "cswUrl": "https://metaver.de/csw"
                    },
                    metaDataCatalogueId: "2"
                },
                metaURLs = ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"];

            testAction(setMetadataURL, "73A344E9-CDB5-4A17-89C1-05E202989755", state, {}, [
                {type: "setMetaURLs", payload: metaURLs}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });
        });

    });
});
