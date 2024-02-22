import testAction from "../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsMapMarker";
import sinon from "sinon";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Point from "ol/geom/Point.js";
import {Icon, Style} from "ol/style.js";
import {expect} from "chai";

const {
    rotatePointMarker
} = actions;

describe("src/modules/mapMarker/store/actionsMapMarker.js", () => {
    let map,
        markerPoint,
        markerPolygon;

    beforeEach(() => {
        const map3D = {
                id: "1",
                mode: "3D",
                getCesiumScene: () => {
                    return {
                        drillPick: () => {
                            return [{
                                primitive: primitive
                            }];
                        }
                    };
                },
                getOlMap: () => {
                    return {
                        getSize: () => {
                            return [
                                100,
                                200
                            ];
                        }
                    };
                }
            },
            primitive = {
                olFeature: {
                    getStyle: () => {
                        return {
                            getImage: () => {
                                return {
                                    getAnchor: () => {
                                        return [
                                            100,
                                            100
                                        ];
                                    }
                                };
                            }
                        };
                    }
                },
                olLayer: {
                    get: () => {
                        return "marker_point_layer";
                    }
                },
                width: 100,
                height: 100,
                scale: 0.5,
                pixelOffset: "",
                rotation: ""
            };

        mapCollection.clear();
        map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy()
        };
        mapCollection.addMap(map, "2D");

        markerPoint = new VectorLayer({
            name: "markerPoint",
            source: new VectorSource(),
            alwaysOnTop: true,
            visible: false,
            style: new Style()
        });
        markerPolygon = new VectorLayer({
            name: "markerPolygon",
            source: new VectorSource(),
            alwaysOnTop: true,
            visible: false,
            style: new Style()
        });
        mapCollection.addMap(map3D, "3D");
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("initializePointMarker", () => {
        it("check initialization of the pointMarker", () => {
            const context = {state: {context: "content"}},
                initResult = actions.initialize(context);

            expect(initResult).to.be.not.null;
        });
    });
});
