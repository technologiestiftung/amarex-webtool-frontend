import sinon from "sinon";
import {expect} from "chai";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import WKTUtil from "../../../../../../shared/js/utils/getWKTGeom";
import wmsGFIUtil from "../../../../../../shared/js/utils/getWmsFeaturesByMimeType";
import actions from "../../../../store/actions/actionsSearchBarSearchResult";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";

const {
    activateLayerInTopicTree,
    addLayerToTopicTree,
    highlightFeature,
    openGetFeatureInfo,
    removeLayerFromTopicTree,
    setMarker,
    showInTree,
    showLayerInfo,
    zoomToResult
} = actions;

describe("src_3_0_0/modules/searchBar/store/actions/actionsSearchBarSearchResult.spec.js", () => {
    let dispatch,
        commit,
        getters,
        zoomLevel;

    beforeEach(() => {
        zoomLevel = 5;

        dispatch = sinon.spy();
        commit = sinon.spy();
        getters = {
            zoomLevel: zoomLevel
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("activateLayerInTopicTree", () => {
        it("should activate a layer in topic tree", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns({
                        id: layerId,
                        zIndex: 1,
                        showInLayerTree: true
                    })
                };

            activateLayerInTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: 1
                    }
                }]
            });
        });

        it("should activate a layer in topic tree and set zIndex", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns({
                        id: layerId,
                        zIndex: 1,
                        showInLayerTree: false
                    }),
                    determineZIndex: () => 2
                };

            activateLayerInTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: 2
                    }
                }]
            });
        });

        it("should add and activate a layer in topic tree", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    visibility: true,
                    showInLayerTree: true,
                    zIndex: 1
                },
                rootGetters = {
                    layerConfigById: sinon.stub().returns(undefined)
                };

            activateLayerInTopicTree({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToTopicTree");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerId: layerId,
                source: {
                    id: layerId,
                    visibility: true,
                    showInLayerTree: true,
                    zIndex: 1
                }
            }
            );
        });

    });

    describe("addLayerToTopicTree", () => {
        it("should add a layer to topic tree", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    abc: "abc",
                    datasets: []
                },
                added = true,
                rootGetters = {
                    layerConfigById: sinon.stub().returns(false)
                };

            dispatch = sinon.stub().resolves(added);
            addLayerToTopicTree({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfig: {
                    id: layerId,
                    abc: "abc",
                    datasets: [],
                    showInLayerTree: true,
                    type: "layer",
                    visibility: true
                },
                parentKey: "subjectlayer"
            });
        });

        it("should activate layer in topic tree", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    abc: "abc",
                    datasets: []
                },
                added = true,
                rootGetters = {
                    layerConfigById: sinon.stub().returns(true)
                };

            dispatch = sinon.stub().resolves(added);
            addLayerToTopicTree({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("activateLayerInTopicTree");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerId,
                source
            });
        });
    });

    describe("removeLayerFromTopicTree", () => {
        it("should remove a layer from topic tree", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns(true)
                };

            removeLayerFromTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: false,
                        showInLayerTree: false
                    }
                }]
            });
        });

        it("should do nothing", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns(false)
                };

            removeLayerFromTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.notCalled).to.be.true;
        });
    });

    describe("showInTree", () => {
        it("should call showLayer", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: () => true
                };

            showInTree({commit, dispatch, rootGetters}, {layerId});

            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Menu/changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                type: "layerSelection",
                side: "mainMenu",
                props: {}
            });
            expect(dispatch.secondCall.args[0]).to.equals("Modules/LayerSelection/showLayer");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                layerId: "123"
            });
            expect(dispatch.thirdCall.args[0]).to.equals("Menu/navigateBack");
            expect(dispatch.thirdCall.args[1]).to.equals("mainMenu");
        });

        it("should call addLayerToTopicTree and showLayer", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    abc: "abc",
                    datasets: []
                },
                rootGetters = {
                    layerConfigById: () => false
                };

            sinon.stub(rawLayerList, "getLayerWhere").returns(source);

            showInTree({commit, dispatch, rootGetters}, {layerId});

            expect(dispatch.callCount).to.equal(4);
            expect(dispatch.firstCall.args[0]).to.equals("Menu/changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                type: "layerSelection",
                side: "mainMenu",
                props: {}
            });
            expect(dispatch.secondCall.args[0]).to.equals("addLayerToTopicTree");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                layerId: "123",
                source,
                showInLayerTree: false,
                visibility: false
            }
            );
            expect(dispatch.thirdCall.args[0]).to.equals("Modules/LayerSelection/showLayer");
            expect(dispatch.thirdCall.args[1]).to.be.deep.equals({
                layerId: "123"
            });
            expect(dispatch.getCall(3).args[0]).to.equals("Menu/navigateBack");
            expect(dispatch.getCall(3).args[1]).to.equals("mainMenu");
        });
    });

    describe("showLayerInfo", () => {
        it("should call startLayerInformation - layer in layerConfig", () => {
            const layerId = "123",
                config = {
                    layerId
                },
                rootGetters = {
                    layerConfigById: () => config
                };

            showLayerInfo({dispatch, commit, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Modules/LayerInformation/startLayerInformation");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(config);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("Modules/LayerSelection/setLayerInfoVisible");
            expect(commit.firstCall.args[1]).to.be.true;
        });

        it("should call startLayerInformation - layer not in layerConfig", () => {
            const layerId = "123",
                config = {
                    layerId
                },
                rootGetters = {
                    layerConfigById: () => false
                };

            sinon.stub(rawLayerList, "getLayerWhere").returns(config);

            showLayerInfo({dispatch, commit, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Modules/LayerInformation/startLayerInformation");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(config);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("Modules/LayerSelection/setLayerInfoVisible");
            expect(commit.firstCall.args[1]).to.be.true;
        });
    });

    describe("highlightFeature", () => {
        it("highlightFeature shall dispatch 'placingPolygonMarker'", () => {
            const hit = {
                    geometryType: "MULTIPOLYGON",
                    coordinate: [
                        ["570374.959", "5936460.361", "570369.316", "5936458.5", "570364.706", "5936473.242", "570370.393", "5936474.993", "570374.959", "5936460.361"],
                        ["556622.043", "5935346.022", "556605.381", "5935347.509", "556583.860", "5935349.429", "556562.872", "5935351.302", "556562.855", "5935344.371", "556604.117", "5935340.974", "556622.043", "5935339.707", "556622.043", "5935346.022"]
                    ],
                    id: "im Verfahren331",
                    name: "HafenCity12-Hamburg-Altstadt48",
                    type: "im Verfahren"
                },
                type = {getType: () => "MultiPolygon"},
                feature = {
                    id: "feature",
                    getGeometry: () => type
                },
                stubGetWKTGeom = sinon.stub(WKTUtil, "getWKTGeom").returns(feature);

            highlightFeature({dispatch}, {hit});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/placingPolygonMarker");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(feature.getGeometry());
            expect(stubGetWKTGeom.calledOnce).to.be.true;
            expect(stubGetWKTGeom.firstCall.args[0]).to.be.deep.equals(hit);
        });
    });

    describe("openGetFeatureInfo", () => {
        it("openGetFeatureInfo shall commit 'setGfiFeatures'", () => {
            const feature = {
                    id: "feature"
                },
                layer = {
                    id: "layer"
                },
                gfiFeature = {
                    getId: () => feature.id,
                    getLayerId: () => layer.id
                },
                stubCreateGfiFeature = sinon.stub(wmsGFIUtil, "createGfiFeature").returns(gfiFeature);

            openGetFeatureInfo({commit}, {feature, layer});
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("Modules/GetFeatureInfo/setGfiFeatures");
            expect(commit.firstCall.args[1]).to.be.deep.equals([gfiFeature]);
            expect(stubCreateGfiFeature.calledOnce).to.be.true;
            expect(stubCreateGfiFeature.firstCall.args[0]).to.be.deep.equals(layer);
            expect(stubCreateGfiFeature.firstCall.args[1]).to.be.equals("");
            expect(stubCreateGfiFeature.firstCall.args[2]).to.be.deep.equals(feature);
        });
    });

    describe("setMarker", () => {
        it("sets the MapMarker with coordinates", () => {
            const coordinates = [1234, 65432],
                payload = [1234, 65432];

            setMarker({dispatch}, {coordinates});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/placingPointMarker");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(payload);
        });

        it("highlights multipolygon feature with style from styleList", () => {
            const coordinates = [1234, 65432],
                payload = [1234, 65432],
                feature = {
                    id: "featureId",
                    getGeometry: () =>{
                        return {
                            getType: () => {
                                return "MultiPolygon";
                            }
                        };
                    }
                },
                layer = {
                    get: () => {
                        return "styleId";
                    }
                },
                rootGetters = {
                    "Modules/GetFeatureInfo/highlightVectorRules": null
                },
                highlightObject = {
                    type: "highlightMultiPolygon",
                    feature: feature,
                    styleId: "styleId",
                    highlightStyle: {
                        fill: {
                            color: "rgb(215, 102, 41, 0.9)"
                        },
                        stroke: {
                            color: "rgb(215, 101, 41, 0.9)",
                            width: 1
                        }
                    }
                };

            sinon.stub(styleList, "returnStyleObject").returns({
                rules: [{
                    style: {
                        polygonFillColor: [215, 102, 41, 0.9],
                        polygonStrokeColor: [215, 101, 41, 0.9],
                        polygonStrokeWidth: [1]
                    }
                }]
            });
            setMarker({dispatch, rootGetters}, {coordinates, feature, layer});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/highlightFeature");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(highlightObject);
            expect(dispatch.secondCall.args[0]).to.equals("Maps/placingPointMarker");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(payload);
        });

        it("highlights multipolygon feature with style from GetFeatureInfo", () => {
            const coordinates = [1234, 65432],
                payload = [1234, 65432],
                feature = {
                    id: "featureId",
                    getGeometry: () =>{
                        return {
                            getType: () => {
                                return "MultiPolygon";
                            }
                        };
                    }
                },
                layer = {
                    get: () => {
                        return "styleId";
                    }
                },
                rootGetters = {
                    "Modules/GetFeatureInfo/highlightVectorRules": {
                        style: {
                            polygonFillColor: [215, 102, 41, 0.9],
                            polygonStrokeColor: [215, 101, 41, 0.9],
                            polygonStrokeWidth: [1]
                        }}
                },
                highlightObject = {
                    type: "highlightMultiPolygon",
                    feature: feature,
                    styleId: "styleId",
                    highlightStyle: {
                        fill: {
                            color: "rgb(215, 102, 41, 0.9)"
                        },
                        stroke: {
                            color: "rgb(215, 101, 41, 0.9)",
                            width: 1
                        }
                    }
                };

            sinon.stub(styleList, "returnStyleObject").returns(null);
            setMarker({dispatch, rootGetters}, {coordinates, feature, layer});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/highlightFeature");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(highlightObject);
            expect(dispatch.secondCall.args[0]).to.equals("Maps/placingPointMarker");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(payload);
        });
    });

    describe("zoomToResult", () => {
        it("zoomToResult with coordinates ", () => {
            const coordinates = [1234, 65432],
                payload = {
                    center: coordinates,
                    zoom: getters.zoomLevel
                };

            zoomToResult({dispatch, getters}, {coordinates});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/zoomToCoordinates");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(payload);
        });
    });
});
