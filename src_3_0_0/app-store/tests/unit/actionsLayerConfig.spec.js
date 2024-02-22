import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import sinon from "sinon";
import {expect} from "chai";
import {treeTopicConfigKey, treeBaselayersKey, treeSubjectsKey} from "../../../shared/js/utils/constants";
import actions from "../../actionsLayerConfig";
import buildTreeStructure from "../../js/buildTreeStructure";

describe("src_3_0_0/app-store/actionsLayerConfig.js", () => {
    let commit,
        dispatch,
        getters,
        state,
        layerList,
        layerConfig,
        layerConfigCustom,
        setIdsAtFoldersSpy,
        buildSpy;
    const restConf = "./resources/rest-services-internet.json",
        layerConf = "./services.json";

    beforeEach(() => {
        layerList = [
            {
                id: "453",
                name: "name453",
                typ: "WMS",
                datasets: [{
                    md_id: "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                    md_name: "md_name_453",
                    kategorie_opendata: ["Umwelt"],
                    kategorie_inspire: ["Gebäude"],
                    kategorie_organisation: "Landesbetrieb Geoinformation und Vermessung"
                }],
                zIndex: 1
            },
            {
                id: "452",
                name: "name452",
                typ: "WMS",
                datasets: [{
                    md_id: "B6A59A2B-2D40-4676-9094-efg",
                    md_name: "md_name_452",
                    kategorie_opendata: ["Umwelt"],
                    kategorie_inspire: ["Gebäude"],
                    kategorie_organisation: "Landesbetrieb Geoinformation und Vermessung"
                }],
                zIndex: 2
            },
            {
                id: "1132",
                name: "name1132",
                typ: "SENSORTHINGS",
                datasets: [{
                    md_id: "B6A59A2B-2D40-4676-9094-abc",
                    md_name: "md_name_1132",
                    kategorie_opendata: ["Umwelt"],
                    kategorie_inspire: ["Gebäude"],
                    kategorie_organisation: "Landesbetrieb Geoinformation und Vermessung"
                }],
                zIndex: 3
            },
            {
                id: "10220",
                name: "layer10220",
                typ: "WFS",
                datasets: [{
                    md_id: "B6A59A2B-2D40-4676-9094-hghghg",
                    md_name: "md_name_10220",
                    kategorie_opendata: ["Verkehr"],
                    kategorie_inspire: ["kein INSPIRE-Thema"],
                    kategorie_organisation: "Landesbetrieb Straßen, Brücken und Gewässer"
                }],
                zIndex: 4
            },
            {
                id: "451",
                name: "name451",
                typ: "WFS",
                zIndex: 5,
                datasets: []
            },
            {
                id: "1103",
                name: "Überschwemmungsgebiete",
                typ: "WMS",
                transparent: true,
                transparency: 0,
                datasets: [{
                    md_id: "0879B86F-4F44-45AA-BA5B-021D9D30AAEF",
                    kategorie_opendata: ["Verkehr"],
                    kategorie_inspire: ["kein INSPIRE-Thema"],
                    kategorie_organisation: "Landesbetrieb Straßen, Brücken und Gewässer"
                }],
                zIndex: 6
            },
            {
                id: "717",
                name: "name717",
                layers: "layer717",
                maxScale: "10000",
                minScale: "10",
                typ: "WMS",
                zIndex: 7,
                datasets: []
            },
            {
                id: "718",
                name: "name718",
                layers: "layer718",
                maxScale: "30000",
                minScale: "30",
                typ: "WMS",
                zIndex: 8,
                datasets: []
            },
            {
                id: "719",
                name: "name719",
                layers: "layer719",
                maxScale: "20000",
                minScale: "20",
                typ: "WMS",
                zIndex: 9,
                datasets: []
            }
        ];
        layerConfig = {};
        layerConfig[treeBaselayersKey] =
        {
            elements: [
                {
                    id: "453",
                    visibility: true
                },
                {
                    id: "452"
                }
            ]
        };
        layerConfig[treeSubjectsKey] = {
            elements: [
                {
                    id: "1132",
                    name: "100 Jahre Stadtgruen POIs",
                    visibility: true
                },
                {
                    id: "10220"
                }
            ]
        };
        layerConfigCustom = {};
        layerConfigCustom[treeBaselayersKey] = {
            elements: [
                {
                    id: [
                        "717",
                        "718",
                        "719"
                    ],
                    visibility: true,
                    name: "Geobasiskarten (farbig)"
                },
                {
                    id: "453"
                }
            ]
        };
        layerConfigCustom[treeSubjectsKey] = {
            elements: [
                {
                    name: "Lage und Gebietszugehörigkeit",
                    type: "folder",
                    id: "folder_1",
                    elements: [
                        {
                            name: "Überschwemmungsgebiete",
                            type: "folder",
                            id: "folder_2",
                            elements: [
                                {
                                    name: "Überschwemmungsgebiete",
                                    type: "folder",
                                    id: "folder_3",
                                    elements: [
                                        {
                                            id: "1103"
                                        }
                                    ]
                                },
                                {
                                    id: "10220"
                                }
                            ]
                        },
                        {
                            id: "10220"
                        },
                        {
                            id: "451"
                        }
                    ]
                }
            ]
        };
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            allLayerConfigsStructured: () => [],
            showLayerAddButton: () => true
        };
        state = {
            configJs: {
                portalConf: "./",
                layerConf: layerConf,
                restConf: restConf
            },
            configJson: {
                [treeTopicConfigKey]: layerConfig
            },
            portalConfigDefaults: {
                tree: {
                    validLayerTypesAutoTree: ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]
                }
            }
        };
        global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
        sinon.stub(rawLayerList, "getLayerWhere").callsFake(function (searchAttributes) {
            return layerList.find(entry => Object.keys(searchAttributes).every(key => entry[key] === searchAttributes[key])) || null;
        });
        sinon.stub(rawLayerList, "getLayerList").returns(layerList);
        setIdsAtFoldersSpy = sinon.spy(buildTreeStructure, "setIdsAtFolders");
        buildSpy = sinon.spy(buildTreeStructure, "build");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("addLayerToLayerConfig", () => {
        it("addLayerToLayerConfig no folders - add config to 'treeSubjectsKey'", () => {
            layerConfig[treeSubjectsKey] = {
                elements: []
            };
            state.layerConfig = layerConfig;
            const layerToAdd = {
                id: "I_m_the_id",
                name: "Trees in Hamburg",
                typ: "WMS",
                layers: "trees",
                url: "https://geodienste.hamburg.de/trees",
                version: "1.4.3",
                visibility: true,
                showInLayerTree: true,
                maxScale: 2000,
                minScale: 12
            };

            getters = {
                allLayerConfigs: [],
                allLayerConfigsByParentKey: () => []
            };

            actions.addLayerToLayerConfig({dispatch, getters, state}, {layerConfig: layerToAdd, parentKey: treeSubjectsKey});
            expect(dispatch.callCount).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("updateLayerConfigZIndex");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerContainer: [],
                maxZIndex: -Infinity
            });
            expect(dispatch.secondCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.secondCall.args[1]).to.be.undefined;
            expect(state.layerConfig[treeSubjectsKey]?.elements.length).to.equal(1);
            expect(state.layerConfig[treeSubjectsKey]?.elements[0]).to.deep.equal(layerToAdd);
        });

        it("addLayerToLayerConfig no folders - add config to 'treeBaselayersKey'", () => {
            layerConfig[treeBaselayersKey] = {
                elements: []
            };
            state.layerConfig = layerConfig;
            const layerToAdd = {
                id: "I_m_the_id",
                name: "Trees in Hamburg",
                typ: "WMS",
                layers: "trees",
                url: "https://geodienste.hamburg.de/trees",
                version: "1.4.3",
                visibility: true,
                showInLayerTree: true,
                maxScale: 2000,
                minScale: 12
            };

            getters = {
                allLayerConfigs: [],
                allLayerConfigsByParentKey: () => []
            };

            actions.addLayerToLayerConfig({dispatch, getters, state}, {layerConfig: layerToAdd, parentKey: treeBaselayersKey});
            expect(dispatch.callCount).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("updateLayerConfigZIndex");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerContainer: [],
                maxZIndex: -Infinity
            });
            expect(dispatch.secondCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.secondCall.args[1]).to.be.undefined;
            expect(state.layerConfig[treeBaselayersKey]?.elements.length).to.equal(1);
            expect(state.layerConfig[treeBaselayersKey]?.elements[0]).to.deep.equal(layerToAdd);
        });

        it("addLayerToLayerConfig with folders - layer not contained in folder - add config to folder elements", () => {
            state.layerConfig = layerConfigCustom;
            const layerToAdd = {
                    id: "I_m_the_id",
                    name: "Trees in Hamburg",
                    typ: "WMS",
                    visibility: true
                },
                folder_3 = layerConfigCustom[treeSubjectsKey].elements[0].elements[0].elements[0];

            getters = {
                allLayerConfigs: [{layerToAdd}],
                folderById: () => folder_3,
                visibleSubjectDataLayerConfigs: []
            };

            actions.addLayerToLayerConfig({dispatch, getters, state}, {layerConfig: layerToAdd, parentKey: "folder_3"});
            expect(dispatch.callCount).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("updateLayerConfigZIndex");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerContainer: [],
                maxZIndex: -Infinity
            });
            expect(dispatch.secondCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.secondCall.args[1]).to.be.undefined;
            expect(state.layerConfig[treeSubjectsKey].elements[0].elements[0].elements[0].elements.length).to.equal(2);
            expect(state.layerConfig[treeSubjectsKey].elements[0].elements[0].elements[0].elements[1]).to.deep.equal(layerToAdd);
        });

        it("addLayerToLayerConfig with folders - layer contained in folder - do not at config", () => {
            state.layerConfig = layerConfigCustom;
            const layerToAdd = {
                    id: "1103",
                    name: "Trees in Hamburg",
                    typ: "WMS",
                    visibility: true
                },
                folder_3 = layerConfigCustom[treeSubjectsKey].elements[0].elements[0].elements[0];

            getters = {
                allLayerConfigs: [{layerToAdd}],
                visibleSubjectDataLayerConfigs: [],
                folderById: () => folder_3
            };

            actions.addLayerToLayerConfig({dispatch, getters, state}, {layerConfig: layerToAdd, parentKey: "folder_3"});
            expect(dispatch.callCount).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("updateLayerConfigZIndex");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerContainer: [],
                maxZIndex: -Infinity
            });
            expect(dispatch.secondCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.secondCall.args[1]).to.be.undefined;
            expect(state.layerConfig[treeSubjectsKey].elements[0].elements[0].elements[0].elements.length).to.equal(1);
            expect(state.layerConfig[treeSubjectsKey].elements[0].elements[0].elements[0].elements[0].id).to.deep.equal(layerToAdd.id);
        });
    });

    describe("updateLayerConfigZIndex", () => {
        it("Should set new zindex for layer with zIndex greater than maxZIndex", () => {
            const layerContainer = layerList.slice(0, 5),
                maxZIndex = 2,
                resultZIndex = [1, 2, 4, 5, 6];

            actions.updateLayerConfigZIndex({}, {layerContainer, maxZIndex});

            layerContainer.forEach((layerContainerConf, index) => {
                expect(layerContainerConf.zIndex).to.equals(resultZIndex[index]);
            });
        });
    });

    describe("extendLayers", () => {
        it("extend layers for simple tree", () => {
            state.layerConfig = layerConfig;
            actions.extendLayers({dispatch, getters, state});

            expect(dispatch.callCount).to.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.firstCall.args[1]).to.be.undefined;
            expect(dispatch.secondCall.args[0]).to.equals("updateLayerConfigs");
            expect(dispatch.secondCall.args[1]).to.deep.equals([
                {id: "453", visibility: true},
                {id: "452"},
                {id: "1132", name: "100 Jahre Stadtgruen POIs", visibility: true},
                {id: "10220"}
            ]
            );
        });

        it("extend layer configs for custom tree", () => {
            state.layerConfig = layerConfigCustom;
            actions.extendLayers({dispatch, getters, state});

            expect(dispatch.callCount).to.be.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.firstCall.args[1]).to.be.undefined;
            expect(dispatch.secondCall.args[0]).to.equals("updateLayerConfigs");
            expect(dispatch.secondCall.args[1]).to.deep.equals([
                {
                    id: ["717", "718", "719"],
                    visibility: true,
                    name: "Geobasiskarten (farbig)"
                },
                {id: "453"},
                {id: "1103"},
                {id: "10220"},
                {id: "10220"},
                {id: "451"}
            ]);
        });

        it("extend layers for special configuration with folders", () => {
            getters = {
                allLayerConfigsStructured: () => []
            };
            layerConfig = {
                [treeSubjectsKey]: {
                    elements: [
                        {
                            id: "1132",
                            name: "100 Jahre Stadtgruen POIs",
                            visibility: true
                        },
                        {
                            id: "10220"
                        },
                        {
                            name: "Titel",
                            type: "folder",
                            elements: [
                                {
                                    name: "3 Layer",
                                    type: "folder",
                                    elements: [
                                        {
                                            id: "717",
                                            visibility: true
                                        },
                                        {
                                            id: "718",
                                            visibility: true
                                        },
                                        {
                                            id: "719"
                                        },
                                        {
                                            name: "Überschwemmungsgebiete",
                                            type: "folder",
                                            elements: [
                                                {
                                                    id: "1103",
                                                    visibility: true
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            };

            state.layerConfig = layerConfig;

            actions.extendLayers({dispatch, getters, state});
            expect(setIdsAtFoldersSpy.calledOnce).to.be.true;
            expect(dispatch.callCount).to.be.equals(2);
            expect(dispatch.firstCall.args[0]).to.equals("addBaselayerAttribute");
            expect(dispatch.firstCall.args[1]).to.be.undefined;
            expect(dispatch.secondCall.args[0]).to.equals("updateLayerConfigs");
            expect(dispatch.secondCall.args[1]).to.deep.equals([
                {id: "1132", name: "100 Jahre Stadtgruen POIs", visibility: true},
                {id: "10220"},
                {id: "717", visibility: true},
                {id: "718", visibility: true},
                {id: "719"},
                {id: "1103", visibility: true}

            ]);
        });

        describe("addBaselayerAttribute", () => {
            it("add the attribute background to baselayer", () => {
                getters = {
                    allLayerConfigsByParentKey: () => layerConfig[treeBaselayersKey].elements
                };

                actions.addBaselayerAttribute({getters});

                expect(layerConfig[treeBaselayersKey].elements).to.deep.equals([
                    {
                        id: "453",
                        visibility: true,
                        baselayer: true
                    },
                    {
                        id: "452",
                        baselayer: true
                    }
                ]);
            });
        });

        describe("processTreeTypeAuto", () => {
            it("process raw layers in auto tree with addLayerButton", () => {
                getters = {
                    activeOrFirstCategory: () => {
                        return {
                            active: true,
                            key: "kategorie_opendata",
                            name: "common:tree.categoryOpendata"
                        };
                    }
                };

                state.portalConfig = {
                    tree: {
                        type: "auto",
                        validLayerTypesAutoTree: ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"],
                        addLayerButton: {
                            "active": true
                        }
                    }
                };

                state.layerConfig = layerConfig;
                delete state.layerConfig[treeSubjectsKey];

                layerList.splice(3, 2);
                layerList.splice(4, 3);

                actions.processTreeTypeAuto({commit, getters, state}, layerConfig[treeBaselayersKey].elements);

                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equals("setLayerConfigByParentKey");
                expect(commit.firstCall.args[1]).to.deep.equals({
                    layerConfigs: {
                        elements: []
                    },
                    parentKey: treeSubjectsKey
                });
                expect(buildSpy.calledOnce).to.be.true;
            });
            it("process raw layers in auto tree without addLayerButton", () => {
                getters = {
                    activeOrFirstCategory: () => {
                        return {
                            active: true,
                            key: "kategorie_opendata",
                            name: "common:tree.categoryOpendata"
                        };
                    }
                };

                state.portalConfig = {
                    tree: {
                        type: "auto",
                        validLayerTypesAutoTree: ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]
                    }
                };

                state.layerConfig = layerConfig;
                delete state.layerConfig[treeSubjectsKey];

                layerList.splice(3, 2);
                layerList.splice(4, 3);

                actions.processTreeTypeAuto({commit, getters, state}, layerConfig[treeBaselayersKey].elements);

                expect(commit.calledOnce).to.be.true;
                expect(commit.firstCall.args[0]).to.equals("setLayerConfigByParentKey");
                expect(commit.firstCall.args[1]).to.deep.equals({
                    layerConfigs: {
                        elements: []
                    },
                    parentKey: treeSubjectsKey
                });
                expect(buildSpy.calledOnce).to.be.true;
            });
        });

        describe("replaceByIdInLayerConfig", () => {
            it("replaceByIdInLayerConfig layer is contained in layerConfig", () => {
                const toReplace = {
                        id: "453",
                        visibility: true,
                        att1: "bla",
                        att2: [{
                            foo: "foo",
                            bar: "bar"
                        }]
                    },
                    determineZIndexSpy = sinon.spy();

                getters = {
                    layerConfigById: () => sinon.stub(),
                    determineZIndex: determineZIndexSpy
                };

                state.layerConfig = layerConfig;

                actions.replaceByIdInLayerConfig({dispatch, getters, state}, {layerConfigs: [{layer: toReplace, id: "453"}]});

                expect(state.layerConfig[treeBaselayersKey].elements).to.be.an("array");
                expect(state.layerConfig[treeBaselayersKey].elements.length).to.be.equals(2);
                expect(Object.keys(state.layerConfig[treeBaselayersKey]?.elements[0]).length).to.be.equals(5);
                expect(state.layerConfig[treeBaselayersKey]?.elements[0].id).to.be.equals("453");
                expect(state.layerConfig[treeBaselayersKey]?.elements[0].visibility).to.be.true;
                expect(state.layerConfig[treeBaselayersKey]?.elements[0].att1).to.be.equals("bla");
                expect(state.layerConfig[treeBaselayersKey]?.elements[0].att2).to.be.deep.equals(toReplace.att2);
                expect(state.layerConfig[treeBaselayersKey]?.elements[1].id).to.be.equals("452");
                expect(Object.keys(state.layerConfig[treeBaselayersKey]?.elements[1]).length).to.be.equals(1);

                expect(state.layerConfig[treeSubjectsKey]?.elements).to.be.an("array");
                expect(state.layerConfig[treeSubjectsKey]?.elements.length).to.be.equals(2);
                expect(state.layerConfig[treeSubjectsKey]?.elements[0].id).to.be.equals("1132");
                expect(Object.keys(state.layerConfig[treeSubjectsKey]?.elements[0]).length).to.be.equals(3);
                expect(state.layerConfig[treeSubjectsKey]?.elements[1].id).to.be.equals("10220");
                expect(Object.keys(state.layerConfig[treeSubjectsKey]?.elements[1]).length).to.be.equals(1);
                expect(determineZIndexSpy.calledOnce).to.be.true;
            });

            it("replaceByIdInLayerConfig layer is not contained in layerConfig", () => {
                const toReplace = {
                        id: "unknown",
                        visibility: true,
                        att1: "bla",
                        att2: [{
                            foo: "foo",
                            bar: "bar"
                        }]
                    },
                    determineZIndexSpy = sinon.spy();

                getters = {
                    layerConfigById: () => null,
                    determineZIndex: determineZIndexSpy
                };
                let stateCopy = null;

                state.layerConfig = layerConfig;
                stateCopy = {...state};

                actions.replaceByIdInLayerConfig({dispatch, getters, state}, {layerConfigs: [{layer: toReplace, id: "unknown"}]});
                expect(state).to.be.deep.equals(stateCopy);
                expect(determineZIndexSpy.calledOnce).to.be.true;
            });

            it("replaceByIdInLayerConfig toReplace-layer is undefined", () => {
                let stateCopy = null;

                getters = {
                    layerConfigById: () => sinon.stub()
                };

                state.layerConfig = layerConfig;
                stateCopy = {...state};

                actions.replaceByIdInLayerConfig({dispatch, getters, state}, undefined);
                expect(state).to.be.deep.equals(stateCopy);
            });
        });

        describe("addOrReplaceLayer", () => {
            it("layer is not contained in layerConfig and not contained in rawLayerList", () => {
                getters = {
                    layerConfigById: () => null
                };
                expect(actions.addOrReplaceLayer({dispatch, getters}, {layerId: "unknown"})).to.be.false;
            });

            it("layer is not contained in layerConfig but contained in rawLayerList, isBaseLayer:false", () => {
                getters = {
                    layerConfigById: () => null,
                    determineZIndex: () => 5
                };
                const expectedConfig = layerList[2];

                expectedConfig.visibility = true;
                expectedConfig.transparency = 0;
                expectedConfig.showInLayerTree = true;
                expectedConfig.zIndex = 5;

                actions.addOrReplaceLayer({dispatch, getters}, {layerId: "1132"});
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equals("addLayerToLayerConfig");
                expect(dispatch.firstCall.args[1]).to.deep.equals({layerConfig: expectedConfig, parentKey: treeSubjectsKey});
            });

            it("layer is not contained in layerConfig but contained in rawLayerList, isBaseLayer:true", () => {
                getters = {
                    layerConfigById: () => null,
                    determineZIndex: () => 5
                };
                const expectedConfig = layerList[0];

                expectedConfig.visibility = true;
                expectedConfig.transparency = 0;
                expectedConfig.showInLayerTree = true;
                expectedConfig.zIndex = 5;

                actions.addOrReplaceLayer({dispatch, getters}, {layerId: "453", isBaseLayer: true});
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equals("addLayerToLayerConfig");
                expect(dispatch.firstCall.args[1]).to.deep.equals({layerConfig: expectedConfig, parentKey: treeBaselayersKey});
            });

            it("layer is contained in layerConfig - change visibility", () => {
                const determineZIndexSpy = sinon.spy(),
                    expectedConfig = {};

                getters = {
                    layerConfigById: () => layerList[2],
                    determineZIndex: determineZIndexSpy
                };
                layerList[2].zIndex = 5;
                layerList[2].showInLayerTree = true;

                expectedConfig.visibility = true;
                expectedConfig.transparency = 0;
                expectedConfig.showInLayerTree = true;
                expectedConfig.zIndex = 5;

                actions.addOrReplaceLayer({dispatch, getters}, {layerId: "1132"});
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
                expect(dispatch.firstCall.args[1]).to.deep.equals({layerConfigs: [{id: "1132", layer: expectedConfig}]});
                expect(determineZIndexSpy.notCalled).to.be.true;
            });

            it("layer is contained in layerConfig - change visibility, new zIndex", () => {
                const determineZIndexSpy = sinon.stub().returns(6),
                    expectedConfig = {};

                getters = {
                    layerConfigById: () => layerList[2],
                    determineZIndex: determineZIndexSpy
                };
                layerList[2].zIndex = 5;
                layerList[2].visibility = true;

                expectedConfig.visibility = true;
                expectedConfig.transparency = 0;
                expectedConfig.showInLayerTree = true;
                expectedConfig.zIndex = 6;

                actions.addOrReplaceLayer({dispatch, getters}, {layerId: "1132", showInLayerTree: true});
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
                expect(dispatch.firstCall.args[1]).to.deep.equals({layerConfigs: [{id: "1132", layer: expectedConfig}]});
                expect(determineZIndexSpy.calledOnce).to.be.true;
            });

        });

        describe("showLayerAttributions", () => {
            it("should throw an alert, if layer has a layerAttribution and visibility true", () => {
                const layerAttributes = {
                    id: "123",
                    name: "The layer",
                    typ: "WMS",
                    visibility: true,
                    showInLayerTree: true,
                    layerAttribution: "This is the layer attribution!"
                };

                actions.showLayerAttributions({dispatch}, layerAttributes);

                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args[0]).to.equals("Alerting/addSingleAlert");
                expect(dispatch.firstCall.args[1]).to.deep.equals({
                    content: "This is the layer attribution!",
                    category: "info",
                    title: "The layer",
                    onceInSession: true
                });
            });

            it("should not throw an alert, if layer has no layerAttribution and visibility true", () => {
                const layerAttributes = {
                    id: "123",
                    name: "The layer",
                    typ: "WMS",
                    visibility: true,
                    showInLayerTree: true
                };

                actions.showLayerAttributions({dispatch}, layerAttributes);

                expect(dispatch.notCalled).to.be.true;
            });

            it("should not throw an alert, if layer has no layerAttribution and visibility false", () => {
                const layerAttributes = {
                    id: "123",
                    name: "The layer",
                    typ: "WMS",
                    visibility: false,
                    showInLayerTree: true
                };

                actions.showLayerAttributions({dispatch}, layerAttributes);

                expect(dispatch.notCalled).to.be.true;
            });

            it("should not throw an alert, if layer has layerAttribution and visibility false", () => {
                const layerAttributes = {
                    id: "123",
                    name: "The layer",
                    typ: "WMS",
                    visibility: false,
                    showInLayerTree: true,
                    layerAttribution: "This is the layer attribution!"
                };

                actions.showLayerAttributions({dispatch}, layerAttributes);

                expect(dispatch.notCalled).to.be.true;
            });
        });

        describe("updateAllZIndexes", () => {
            it("updateAllZIndexes does not set zIndexes, if no zIndexes are set before", () => {
                getters = {
                    allLayerConfigsByParentKey: (key) => {
                        if (key === treeBaselayersKey) {
                            return layerConfig[treeBaselayersKey].elements;
                        }
                        return layerConfig[treeSubjectsKey].elements;
                    }
                };

                actions.updateAllZIndexes({dispatch, getters});
                expect(layerConfig[treeBaselayersKey].elements[0].zIndex).to.be.undefined;
                expect(layerConfig[treeBaselayersKey].elements[1].zIndex).to.be.undefined;
                expect(layerConfig[treeSubjectsKey].elements[0].zIndex).to.be.undefined;
                expect(layerConfig[treeSubjectsKey].elements[1].zIndex).to.be.undefined;
            });

            it("updateAllZIndexes with all zIndexes are set before", () => {
                getters = {
                    allLayerConfigsByParentKey: (key) => {
                        if (key === treeBaselayersKey) {
                            return layerConfig[treeBaselayersKey].elements;
                        }
                        return layerConfig[treeSubjectsKey].elements;
                    }
                };

                layerConfig[treeBaselayersKey].elements[0].zIndex = 1;
                layerConfig[treeBaselayersKey].elements[1].zIndex = 2;
                layerConfig[treeSubjectsKey].elements[0].zIndex = 5;
                layerConfig[treeSubjectsKey].elements[1].zIndex = 6;
                actions.updateAllZIndexes({getters});

                expect(layerConfig[treeBaselayersKey].elements[0].zIndex).to.be.equals(1);
                expect(layerConfig[treeBaselayersKey].elements[1].zIndex).to.be.equals(2);
                expect(layerConfig[treeSubjectsKey].elements[0].zIndex).to.be.equals(3);
                expect(layerConfig[treeSubjectsKey].elements[1].zIndex).to.be.equals(4);
            });

            it("updateAllZIndexes with some zIndexes are set before", () => {
                getters = {
                    allLayerConfigsByParentKey: (key) => {
                        if (key === treeBaselayersKey) {
                            return layerConfig[treeBaselayersKey].elements;
                        }
                        return layerConfig[treeSubjectsKey].elements;
                    }
                };

                layerConfig[treeBaselayersKey].elements[0].zIndex = 1;
                layerConfig[treeSubjectsKey].elements[0].zIndex = 5;
                layerConfig[treeSubjectsKey].elements[1].zIndex = 6;
                actions.updateAllZIndexes({getters});

                expect(layerConfig[treeBaselayersKey].elements[0].zIndex).to.be.equals(1);
                expect(layerConfig[treeBaselayersKey].elements[1].zIndex).to.be.equals(undefined);
                expect(layerConfig[treeSubjectsKey].elements[0].zIndex).to.be.equals(2);
                expect(layerConfig[treeSubjectsKey].elements[1].zIndex).to.be.equals(3);
            });
        });
    });

    describe("changeCategory", () => {
        const
            invisibleBaselayer = [
                {
                    id: "baselayer1",
                    isBaselayer: true
                }
            ],
            rootGetters = {
                invisibleBaselayerConfigs: invisibleBaselayer
            },
            categories = [
                {
                    "key": "kategorie_opendata",
                    "name": "common:modules.layerTree.categoryOpendata",
                    "active": true
                },
                {
                    "key": "kategorie_inspire",
                    "name": "common:modules.layerTree.categoryInspire"
                },
                {
                    "key": "kategorie_organisation",
                    "name": "common:modules.layerTree.categoryOrganisation"
                }
            ];

        beforeEach(() => {
            state.portalConfig = {
                tree: {
                    type: "auto",
                    validLayerTypesAutoTree: ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"],
                    categories
                }
            };

            state.layerConfig = layerConfig;
        });
        it("changes the category to inspire", () => {
            actions.changeCategory({commit, dispatch, getters, rootGetters, state}, categories[1]);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setLayerConfigByParentKey");
            expect(commit.firstCall.args[1].layerConfigs.elements[0].name).to.be.equals("Gebäude");
            expect(commit.firstCall.args[1].layerConfigs.elements[1].name).to.be.equals("kein INSPIRE-Thema");
            expect(commit.firstCall.args[1].parentKey).to.be.equals(treeSubjectsKey);
            expect(commit.secondCall.args[0]).to.equals("Modules/LayerSelection/clearLayerSelection");
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Modules/LayerSelection/navigateForward");
            expect(dispatch.firstCall.args[1].lastFolderName).to.equals("root");
            expect(dispatch.firstCall.args[1].subjectDataLayerConfs[0].name).to.equals("Gebäude");
            expect(dispatch.firstCall.args[1].subjectDataLayerConfs[1].name).to.equals("kein INSPIRE-Thema");
            expect(dispatch.firstCall.args[1].baselayerConfs).to.deep.equals(invisibleBaselayer);
            expect(buildSpy.calledOnce).to.be.true;
        });

        it("changes the category to organisation", () => {
            actions.changeCategory({commit, dispatch, getters, rootGetters, state}, categories[2]);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setLayerConfigByParentKey");
            expect(commit.firstCall.args[1].layerConfigs.elements[0].name).to.be.equals("Landesbetrieb Geoinformation und Vermessung");
            expect(commit.firstCall.args[1].layerConfigs.elements[1].name).to.be.equals("Landesbetrieb Straßen, Brücken und Gewässer");
            expect(commit.firstCall.args[1].parentKey).to.be.equals(treeSubjectsKey);
            expect(commit.secondCall.args[0]).to.equals("Modules/LayerSelection/clearLayerSelection");
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Modules/LayerSelection/navigateForward");
            expect(dispatch.firstCall.args[1].lastFolderName).to.equals("root");
            expect(dispatch.firstCall.args[1].subjectDataLayerConfs[0].name).to.equals("Landesbetrieb Geoinformation und Vermessung");
            expect(dispatch.firstCall.args[1].subjectDataLayerConfs[1].name).to.equals("Landesbetrieb Straßen, Brücken und Gewässer");
            expect(dispatch.firstCall.args[1].baselayerConfs).to.deep.equals(invisibleBaselayer);
            expect(buildSpy.calledOnce).to.be.true;
        });
    });

});
