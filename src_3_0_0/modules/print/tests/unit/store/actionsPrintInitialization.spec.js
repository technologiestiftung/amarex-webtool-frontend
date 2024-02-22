import {expect} from "chai";
import VectorLayer from "ol/layer/Vector.js";
import sinon from "sinon";
import store from "../../../../../app-store";

import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsPrintInitialization";
import Canvas from "../../../js/buildCanvas";

const {
    chooseCurrentLayout,
    parseMapfishCapabilities,
    parsePlotserviceCapabilities,
    getGfiForPrint,
    getAttributeInLayoutByName,
    togglePostrenderListener,
    setPrintLayers,
    updateCanvasLayer,
    createPrintMask,
    getOptimalScale,
    getOptimalResolution,
    drawMask,
    drawPrintPage,
    getPrintMapSize,
    getPrintMapScales,
    setDpiList,
    compute3dPrintMask
} = actions;

describe("src_3_0_0/modules/print/store/actionsPrintInitialization.js", () => {
    let map = null,
        commit,
        dispatch,
        getters,
        rootGetters;

    before(() => {
        map = {
            id: "ol",
            mode: "2D",
            render: sinon.spy(),
            getLayers: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });
    beforeEach(() => {
        store.getters = {
            "Maps/getResolutionByScale": () => sinon.stub()
        };

        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            visibleLayer: [],
            invisibleLayer: [],
            hintInfo: "",
            showInvisibleLayerInfo: true
        };
    });

    afterEach(sinon.restore);
    describe("chooseCurrentLayout", () => {
        it("should choose the current Layout", done => {
            const payload = [
                    {
                        name: "A4 Hochformat"
                    },
                    {
                        name: "A4 Querformat"
                    },
                    {
                        name: "A3 Hochformat"
                    },
                    {
                        name: "A3 Querformat"
                    }
                ],
                state = {
                    currentLayoutName: "A3 Querformat",
                    currentLayout: {name: "A3 Querformat"}
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(chooseCurrentLayout, payload, state, {}, [
                {type: "setCurrentLayout", payload: state.currentLayout},
                {type: "setCurrentLayoutName", payload: state.currentLayout.name}
            ], {}, done);
        });
    });

    describe("parseMapfishCapabilities", function () {
        it("should parse the mapfish capabilities", done => {
            const payload = {
                layouts: [
                    {
                        name: "A4 Hochformat"
                    },
                    {
                        name: "A4 Querformat"
                    },
                    {
                        name: "A3 Hochformat"
                    },
                    {
                        name: "A3 Querformat"
                    }
                ],
                formats: [
                    "jpg", "png", "pdf"
                ]
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(parseMapfishCapabilities, payload, {}, {}, [
                {type: "setLayoutList", payload: payload.layouts}
            ], {}, done);
        });
    });

    describe("parsePlotserviceCapabilities", function () {
        it("should parse the plotservice capabilities", done => {
            const payload = {
                layouts: [
                    {
                        name: "A4 Hochformat",
                        geoDocument: "pdf_a4_hoch"
                    },
                    {
                        name: "A4 Querformat",
                        geoDocument: "pdf_a4_quer"
                    },
                    {
                        name: "A3 Hochformat",
                        geoDocument: "pdf_a3_hoch"
                    },
                    {
                        name: "A3 Querformat",
                        geoDocument: "pdf_a3_quer"
                    }
                ],
                formats: [
                    "jpg", "png", "pdf"
                ]
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(parsePlotserviceCapabilities, payload, {}, {}, [
                {type: "setLayoutList", payload: payload.layouts}
            ], {}, done);
        });
    });

    describe("getGfiForPrint", function () {
        it("should set empty gfi for print", done => {

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getGfiForPrint, null, {}, {}, [
                {type: "setGfiForPrint", payload: []}
            ], {}, done, {"Modules/GetFeatureInfo/currentFeature": null});
        });
        it("should set gfi for print", done => {
            const feature = {
                getTitle: () => "TestTitle",
                getMappedProperties: () => "TestProperties"
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getGfiForPrint, null, {}, {}, [
                {type: "setGfiForPrint", payload: ["TestProperties", "TestTitle", undefined]}
            ], {}, done, {"Modules/GetFeatureInfo/currentFeature": feature, "Map/clickCoord": undefined});
        });
    });

    describe("getAttributeInLayoutByName", function () {
        it("should set nothing because gfi isn't available", done => {
            const state = {
                currentLayout: {
                    attributes: [
                        {name: "title"},
                        {name: "map"},
                        {name: "scale"},
                        {name: "master"},
                        {name: "title"}
                    ]
                }
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getAttributeInLayoutByName, "gfi", state, {}, [
            ], {}, done);
        });
    });

    describe("togglePostrenderListener", function () {
        it("should toggle the post render listener and should register listener", done => {
            const TileLayer = {},
                state = {
                    visibleLayerList: [
                        TileLayer,
                        VectorLayer,
                        VectorLayer,
                        VectorLayer,
                        VectorLayer
                    ],
                    eventListener: undefined,
                    layoutList: [{
                        name: "A4 Hochformat"
                    }]
                };

            Canvas.getCanvasLayer = sinon.spy(() => ({
                on: () => "postrender"
            }));

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(togglePostrenderListener, undefined, state, {}, [
                {type: "setVisibleLayer", payload: state.visibleLayerList, commit: true},
                {type: "setEventListener", payload: "postrender", commit: true}
            ], {}, done);
        });
    });

    describe("setPrintLayers", function () {
        it("one layer is invisible in print scale, shows hint", () => {
            const layer = {
                    getMaxResolution: () => 66.807,
                    getMinResolution: () => 10.132,
                    get: () => "name"
                },
                scale = 40000;

            getters.invisibleLayer.push(layer);

            setPrintLayers({dispatch, commit, getters}, scale);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setHintInfo");
            expect(commit.firstCall.args[1].length > 0).to.be.true;
            expect(commit.secondCall.args[0]).to.be.equals("setInvisibleLayer");
            expect(commit.secondCall.args[1].length).to.be.equals(1);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("Alerting/addSingleAlert");
            expect(typeof dispatch.firstCall.args[1]).to.deep.equals("object");
        });
        it("one layer is invisible in print scale, shows no hint, because showInvisibleLayerInfo is false", () => {
            const layer = {
                    getMaxResolution: () => 66.807,
                    getMinResolution: () => 10.132,
                    get: () => "name"
                },
                scale = 40000;

            getters.invisibleLayer.push(layer);
            getters.showInvisibleLayerInfo = false;

            setPrintLayers({dispatch, commit, getters, rootGetters}, scale);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setInvisibleLayer");
            expect(commit.firstCall.args[1].length).to.be.equals(1);
            expect(dispatch.notCalled).to.be.true;
        });
        it("no layer is invisible in print scale, shows no hint", () => {
            const layer = {
                    getMaxResolution: () => 66.807,
                    getMinResolution: () => 0.132,
                    get: () => "name"
                },
                scale = 40000;

            getters.visibleLayer.push(layer);

            setPrintLayers({dispatch, commit, getters, rootGetters}, scale);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setHintInfo");
            expect(commit.firstCall.args[1]).to.be.equals("");
            expect(commit.secondCall.args[0]).to.be.equals("setInvisibleLayer");
            expect(commit.secondCall.args[1].length).to.be.equals(0);
            expect(dispatch.notCalled).to.be.true;
        });
    });

    describe("updateCanvasLayer", function () {
        it("should update to draw the print page rectangle onto the canvas when the map changes", done => {
            const TileLayer = {
                    getMaxResolution: () => 66.80725559074865,
                    getMinResolution: () => 0.13229159522920522,
                    setVisible: () => true
                },
                scale = 40000,
                state = {
                    visibleLayerList: [
                        TileLayer
                    ],
                    eventListener: {abc: 123},
                    layoutList: [
                        {
                            name: "A4 Hochformat"
                        },
                        {
                            name: "A4 Querformat"
                        },
                        {
                            name: "A3 Hochformat"
                        },
                        {
                            name: "A3 Querformat"
                        }
                    ]
                };

            Canvas.getCanvasLayer = sinon.spy(() => ({
                on: () => "postrender"
            }));

            testAction(updateCanvasLayer, scale, state, {}, [
                {type: "Maps/unregisterListener", payload: {type: state.eventListener}, dispatch: true},
                {type: "chooseCurrentLayout", payload: state.layoutList, dispatch: true},
                {type: "setEventListener", payload: "postrender", commit: true}
            ], {}, done);
        });
        after(function () {
            sinon.restore();
        });
    });

    describe("createPrintMask", function () {
        it("creates the print Mask", done => {
            const evt = {
                    context: {
                        canvas: {},
                        direction: "ltr",
                        fillStyle: "#000000",
                        filter: "none",
                        font: "10px sans-serif",
                        globalAlpha: 1,
                        globalCompositeOperation: "source-over",
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: "low",
                        lineCap: "butt",
                        lineDashOffset: 0,
                        lineJoin: "miter",
                        lineWidth: 1,
                        miterLimit: 10,
                        shadowBlur: 0,
                        shadowColor: "rgba(0, 0, 0, 0)",
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        strokeStyle: "#000000",
                        textAlign: "start",
                        textBaseline: "alphabetic",
                        fill: () => {
                            return null;
                        }
                    },
                    frameState: {
                        size: [1348, 864],
                        pixelToCoordinateTransform: [10.583327618336, 0, 0, -10.583327618336, 1104618.7926526342, 7087941.480887591],
                        viewState: {
                            resolution: 15.874991427504629
                        }
                    }
                },
                state = {
                    layoutMapInfo: [772, 1044],
                    isScaleSelectedManually: false,
                    autoAdjustScale: true,
                    scaleList: [500, 1000, 2500, 5000, 10000, 20000, 40000, 60000, 100000],
                    optimalScale: 20000
                },
                canvasOptions = {
                    "mapSize": evt.frameState.size,
                    "resolution": evt.frameState.viewState.resolution,
                    "printMapSize": state.layoutMapInfo,
                    "scaleList": state.scaleList
                },
                drawMaskOpt = {
                    "frameState": evt.frameState,
                    "context": evt.context
                },
                canvasPrintOptions = {
                    "mapSize": evt.frameState.size,
                    "pixelToCoordinateTransform": evt.frameState.pixelToCoordinateTransform,
                    "resolution": evt.frameState.viewState.resolution,
                    "printMapSize": state.layoutMapInfo,
                    "scale": 20000,
                    "context": evt.context
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(createPrintMask, evt, state, {}, [
                {type: "getPrintMapSize", payload: undefined, dispatch: true},
                {type: "getPrintMapScales", payload: undefined, dispatch: true},
                {type: "getOptimalScale", payload: canvasOptions, dispatch: true},
                {type: "drawMask", payload: drawMaskOpt, dispatch: true},
                {type: "drawPrintPage", payload: canvasPrintOptions, dispatch: true},
                {type: "setPrintLayers", payload: state.optimalScale, dispatch: true}
            ], {}, done);
        });
    });

    describe("getOptimalScale", function () {
        it("returns the optimal scale", done => {
            const frameState = {
                    size: [1348, 864],
                    viewState: {
                        resolution: 15.874991427504629
                    }
                },
                state = {
                    layoutMapInfo: [772, 1044],
                    isScaleSelectedManually: false,
                    autoAdjustScale: true,
                    scaleList: [500, 1000, 2500, 5000, 10000, 20000, 40000, 60000, 100000],
                    optimalScale: 20000,
                    DOTS_PER_INCH: 72,
                    INCHES_PER_METER: 39.37
                },
                canvasOptions = {
                    "mapSize": frameState.size,
                    "resolution": frameState.viewState.resolution,
                    "printMapSize": state.layoutMapInfo,
                    "scaleList": state.scaleList
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getOptimalScale, canvasOptions, state, {}, [
                {type: "setOptimalScale", payload: 20000, commit: true},
                {type: "setCurrentScale", payload: 20000, commit: true}
            ], {}, done);
        });
    });

    describe("getOptimalResolution", function () {
        it("returns the optimal resolution", done => {
            const resolution = {
                    scale: 10000,
                    mapSize: [951, 864],
                    printMapSize: [772, 1044]
                },
                state = {
                    DOTS_PER_INCH: 72,
                    INCHES_PER_METER: 39.37
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getOptimalResolution, resolution, state, {}, [
                {type: "setOptimalResolution", payload: 4.262740006961495, commit: true}
            ], {}, done);
        });
    });

    describe("drawMask", function () {
        it("should draw the print Mask", done => {
            const evt = {
                    context: {
                        canvas: {},
                        direction: "ltr",
                        fillStyle: "#000000",
                        filter: "none",
                        font: "10px sans-serif",
                        globalAlpha: 1,
                        globalCompositeOperation: "source-over",
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: "low",
                        lineCap: "butt",
                        lineDashOffset: 0,
                        lineJoin: "miter",
                        lineWidth: 1,
                        miterLimit: 10,
                        shadowBlur: 0,
                        shadowColor: "rgba(0, 0, 0, 0)",
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        strokeStyle: "#000000",
                        textAlign: "start",
                        textBaseline: "alphabetic",
                        beginPath: () => {
                            return null;
                        },
                        moveTo: () => {
                            return null;
                        },
                        lineTo: () => {
                            return null;
                        },
                        closePath: () => {
                            return null;
                        }
                    },
                    frameState: {
                        size: [1348, 864],
                        viewState: {
                            resolution: 15.874991427504629
                        }
                    }
                },
                drawMaskOpt = {
                    "frameState": evt.frameState,
                    "context": evt.context
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(drawMask, drawMaskOpt, null, {}, [], {}, done);
        });
    });

    describe("drawPrintPage", function () {
        it("should draw the print page", done => {
            const evt = {
                    context: {
                        canvas: {
                            width: 1348
                        },
                        direction: "ltr",
                        fillStyle: "#000000",
                        filter: "none",
                        font: "10px sans-serif",
                        globalAlpha: 1,
                        globalCompositeOperation: "source-over",
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: "low",
                        lineCap: "butt",
                        lineDashOffset: 0,
                        lineJoin: "miter",
                        lineWidth: 1,
                        miterLimit: 10,
                        shadowBlur: 0,
                        shadowColor: "rgba(0, 0, 0, 0)",
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        strokeStyle: "#000000",
                        textAlign: "start",
                        textBaseline: "alphabetic",
                        moveTo: () => {
                            return null;
                        },
                        lineTo: () => {
                            return null;
                        },
                        closePath: () => {
                            return null;
                        }
                    },
                    frameState: {
                        pixelToCoordinateTransform: [10.583327618336, 0, 0, -10.583327618336, 1104618.7926526342, 7087941.480887591],
                        size: [1348, 864],
                        viewState: {
                            resolution: 15.874991427504629
                        }
                    }
                },
                state = {
                    layoutMapInfo: [772, 1044],
                    isScaleSelectedManually: false,
                    autoAdjustScale: true,
                    scaleList: [500, 1000, 2500, 5000, 10000, 20000, 40000, 60000, 100000],
                    optimalScale: 20000,
                    DOTS_PER_INCH: 72,
                    INCHES_PER_METER: 39.37
                },
                canvasPrintOptions = {
                    "mapSize": evt.frameState.size,
                    "pixelToCoordinateTransform": evt.frameState.pixelToCoordinateTransform,
                    "resolution": evt.frameState.viewState.resolution,
                    "printMapSize": state.layoutMapInfo,
                    "scale": 20000,
                    "context": evt.context
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(drawPrintPage, canvasPrintOptions, state, {}, [], {}, done);
        });
    });

    describe("getPrintMapSize", function () {
        it("should commit the printMapSize", done => {
            const state = {
                mapAttribute: {
                    clientInfo: {
                        width: 772,
                        height: 1044
                    }
                }
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getPrintMapSize, undefined, state, {}, [
                {type: "getAttributeInLayoutByName", payload: "map", dispatch: true},
                {type: "setLayoutMapInfo", payload: [772, 1044], commit: true}
            ], {}, done);
        });
    });
    describe("getPrintMapScales", function () {
        it("should commit the scales", done => {
            const state = {
                mapAttribute: {
                    clientInfo: {
                        scales: [
                            250000,
                            100000,
                            60000,
                            40000,
                            20000,
                            10000,
                            5000,
                            2500,
                            1000,
                            500
                        ]
                    }
                }
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(getPrintMapScales, undefined, state, {}, [
                {type: "getAttributeInLayoutByName", payload: "map", dispatch: true},
                {type: "setScaleList", payload: state.mapAttribute.clientInfo.scales, commit: true}
            ], {}, done);
        });
    });
    describe("getPrintDpis", function () {
        it("should commit the dpis", done => {
            const dpis = [72, 150, 300],
                state = {
                    currentLayout: {
                        attributes: [
                            {
                                name: "map",
                                clientInfo: {
                                    dpiSuggestions: dpis
                                }
                            }
                        ]
                    }
                };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done, rootGetters
            testAction(setDpiList, undefined, state, {}, [
                {type: "setDpiList", payload: dpis, commit: true}
            ], {}, done);
        });
    });
    describe("compute3dPrintMask", () => {
        it("should dispatch getPrintMapSize and getPrintMapScales", done => {
            const state = {
                mapAttribute: {
                    clientInfo: {
                        width: 772,
                        height: 1044
                    }
                }
            };

            testAction(compute3dPrintMask, undefined, state, {}, [
                {type: "getPrintMapSize", payload: undefined, dispatch: true},
                {type: "getPrintMapScales", payload: undefined, dispatch: true}
            ], {}, done);
        });
    });
});
