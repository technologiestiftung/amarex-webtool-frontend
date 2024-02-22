import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
// import Cluster from "ol/source/Cluster.js";
// import Feature from "ol/Feature.js";
// import Point from "ol/geom/Point.js";
import {expect} from "chai";
import sinon from "sinon";
import STALayer from "../../sta";
import store from "../../../../app-store";
import Collection from "ol/Collection";
import {Style} from "ol/style.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle.js";

describe("src/core/layers/sta.js", () => {
    const consoleWarn = console.warn;
    let attributes,
        sensorLayer;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            },
            getLayers: () => {
                return new Collection();
            }
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        attributes = {
            url: "https://url.de",
            name: "staTestLayer",
            id: "id",
            typ: "SensorThings",
            version: "1.1",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false
        };
        store.getters = {
            treeType: "custom"
        };
        sensorLayer = new STALayer(attributes);
        console.warn = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.warn = consoleWarn;
    });

    describe("createLayer", () => {
        it("createLayer with isSelected=true shall set layer visible", () => {
            attributes.isSelected = true;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(staLayer.get("isVisibleInMap")).to.be.true;
            expect(staLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=false shall set layer not visible", () => {
            attributes.isSelected = false;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(staLayer.get("isVisibleInMap")).to.be.false;
            expect(staLayer.get("layer").getVisible()).to.be.false;
        });
    });

    describe("getStyleFunction", () => {
        it("initStyle shall be called on creation and call createStyle if styleListLoaded=true", function () {
            const createStyleSpy = sinon.spy(STALayer.prototype, "createStyle");

            store.getters = {
                styleListLoaded: true
            };
            attributes.styleId = "styleId";
            new STALayer(attributes);

            expect(createStyleSpy.calledOnce).to.be.true;
        });
        it("initStyle shall be called on creation and not call createStyle if styleListLoaded=false", function () {
            const createStyleSpy = sinon.spy(STALayer.prototype, "createStyle");

            store.getters = {
                styleListLoaded: false
            };
            attributes.styleId = "styleId";
            new STALayer(attributes);

            expect(createStyleSpy.notCalled).to.be.true;
        });

        it("createStyle shall return a function", function () {
            let layer = null,
                styleFunction = null;

            sinon.stub(styleList, "returnStyleObject").returns(true);
            attributes.styleId = "styleId";
            layer = new STALayer(attributes);
            layer.createStyle(attributes);
            styleFunction = layer.getStyleFunction();

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
        it("getStyleFunction shall return null when style is null", () => {
            let layer = null,
                styleFunction = null;

            sinon.stub(createStyle, "createStyle").returns(null);
            layer = new STALayer(attributes);
            layer.createStyle(attributes);
            styleFunction = layer.getStyleFunction();

            expect(styleFunction).to.equal(null);
        });
    });

    describe("updateSource", () => {
        it("updateSource shall refresh source if 'sourceUpdated' is false", () => {
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(staLayer.get("sourceUpdated")).to.be.false;
            staLayer.updateSource();
            expect(spy.calledOnce).to.be.true;
            expect(staLayer.get("sourceUpdated")).to.be.true;
        });
        it("updateSource shall not refresh source if 'sourceUpdated' is true", () => {
            attributes.sourceUpdated = true;
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(staLayer.get("sourceUpdated")).to.be.true;
            staLayer.updateSource();
            expect(spy.notCalled).to.be.true;
            expect(staLayer.get("sourceUpdated")).to.be.true;
        });
    });

    describe("functions for features", () => {
        let style1 = null,
            style2 = null,
            style3 = null;
        const features = [{
            getId: () => "1",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style1 = fn;
            }
        },
        {
            getId: () => "2",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style2 = fn;
            }
        },
        {
            getId: () => "3",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style3 = fn;
            }
        }];

        it("hideAllFeatures", () => {
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            staLayer.hideAllFeatures();

            expect(staLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledOnce).to.be.true;
            expect(addFeaturesStub.calledOnce).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;

        });
        it("showAllFeatures", () => {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(createStyle, "createStyle").returns(new Style());
            store.getters = {
                "Maps/getView": {
                    getZoomForResolution: () => 1,
                    getResolutions: () => 10
                }
            };
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer");

            staLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            staLayer.showAllFeatures();

            expect(staLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("object");
            expect(style1).not.to.be.null;
            expect(typeof style2).to.be.equals("object");
            expect(style2).not.to.be.null;
            expect(typeof style3).to.be.equals("object");
            expect(style3).not.to.be.null;

        });
        it("showFeaturesByIds", () => {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(createStyle, "createStyle").returns(new Style());
            store.getters = {
                "Maps/getView": {
                    getZoomForResolution: () => 1,
                    getResolutions: () => 10
                }
            };
            const staLayer = new STALayer(attributes),
                layer = staLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear");

            staLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            staLayer.showFeaturesByIds(["1"]);

            expect(staLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("object");
            expect(style1).not.to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
            expect(clearStub.calledOnce).to.be.true;
        });
    });

    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", () => {
            const staLayer = new STALayer(attributes);

            let ret = staLayer.getStyleAsFunction(() => {
                return "test";
            });

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = staLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", () => {
            const staLayer = new STALayer(attributes);

            staLayer.set("style", () => {
                return "test";
            });

            staLayer.styling();
            expect(typeof staLayer.get("layer").getStyle()).to.be.equals("function");
            expect(staLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });

    describe("updateFeatureProperties", () => {
        // it("should return false if the given feature has no get function", () => {
        //     expect(sensorLayer.updateFeatureProperties(undefined)).to.be.false;
        //     expect(sensorLayer.updateFeatureProperties(null)).to.be.false;
        //     expect(sensorLayer.updateFeatureProperties(1234)).to.be.false;
        //     expect(sensorLayer.updateFeatureProperties(true)).to.be.false;
        //     expect(sensorLayer.updateFeatureProperties(false)).to.be.false;
        //     expect(sensorLayer.updateFeatureProperties([])).to.be.false;
        //     expect(sensorLayer.updateFeatureProperties({})).to.be.false;
        // });
        // it("should return false if the given feature has not set function", () => {
        //     expect(sensorLayer.updateFeatureProperties({get: () => false})).to.be.false;
        // });
        // it("should return false if the feature has no dataStreamId property", () => {
        //     expect(sensorLayer.updateFeatureProperties({get: () => false, set: () => false})).to.be.false;
        // });
        // it("should return false if the feature has no dataStreamName property", () => {
        //     expect(sensorLayer.updateFeatureProperties({get: key => key === "dataStreamId" ? "str" : false, set: () => false})).to.be.false;
        // });
        // it("should return false if the feature has no dataStreamName property", () => {
        //     expect(sensorLayer.updateFeatureProperties({get: key => key === "dataStreamId" ? "str" : false, set: () => false})).to.be.false;
        // });
        // it("should return true and change the feature", () => {
        //     const setLogger = [],
        //         feature = {
        //             get: key => {
        //                 if (key === "dataStreamId") {
        //                     return "1 | 2";
        //                 }
        //                 else if (key === "dataStreamName") {
        //                     return "nameA | nameB";
        //                 }
        //                 else if (key === "dataStreamValue") {
        //                     return "nameA | nameB";
        //                 }
        //                 else if (key === "dataStreamPhenomenonTime") {
        //                     return "phenomenonTimeA | phenomenonTimeB";
        //                 }
        //                 return undefined;
        //             },
        //             set: (key, value) => {
        //                 setLogger.push({key, value});
        //             }
        //         },
        //         expected = [
        //             {
        //                 key: "dataStream_2_nameB",
        //                 value: "result"
        //             },
        //             {
        //                 key: "dataStream_2_nameB_phenomenonTime",
        //                 value: "phenomenonTime"
        //             },
        //             {
        //                 key: "dataStreamValue",
        //                 value: "nameA | result"
        //             },
        //             {
        //                 key: "dataStreamPhenomenonTime",
        //                 value: "phenomenonTimeA | phenomenonTime"
        //             }
        //         ];

        //     expect(sensorLayer.updateFeatureProperties(feature, "2", "result", "phenomenonTime", "showNoDataValue", "noDataValue", "funcChangeFeatureGFI")).to.be.true;
        //     expect(setLogger).to.deep.equal(expected);
        // });
        // it("should return true and change the feature with showNoDataValue and noDataValue", () => {
        //     const setLogger = [],
        //         feature = {
        //             get: key => {
        //                 if (key === "dataStreamId") {
        //                     return "1 | 2";
        //                 }
        //                 else if (key === "dataStreamName") {
        //                     return "nameA | nameB";
        //                 }
        //                 else if (key === "dataStreamValue") {
        //                     return "nameA | nameB";
        //                 }
        //                 else if (key === "dataStreamPhenomenonTime") {
        //                     return "phenomenonTimeA | phenomenonTimeB";
        //                 }
        //                 return undefined;
        //             },
        //             set: (key, value) => {
        //                 setLogger.push({key, value});
        //             }
        //         },
        //         expected = [
        //             {
        //                 key: "dataStream_2_nameB",
        //                 value: "noDataValue"
        //             },
        //             {
        //                 key: "dataStream_2_nameB_phenomenonTime",
        //                 value: "phenomenonTime"
        //             },
        //             {
        //                 key: "dataStreamValue",
        //                 value: "nameA | noDataValue"
        //             },
        //             {
        //                 key: "dataStreamPhenomenonTime",
        //                 value: "phenomenonTimeA | phenomenonTime"
        //             }
        //         ];

        //     expect(sensorLayer.updateFeatureProperties(feature, "2", "", "phenomenonTime", true, "noDataValue", "funcChangeFeatureGFI")).to.be.true;
        //     expect(setLogger).to.deep.equal(expected);
        // });
        it("should return true call the given change feature gfi function", () => {
            let lastFeature = null;
            const feature = {
                get: () => "1 | 2",
                set: () => false
            };

            expect(sensorLayer.updateFeatureProperties(feature, "2", "result", "phenomenonTime", "showNoDataValue", "noDataValue", feat => {
                lastFeature = feat;
            })).to.be.true;
            expect(lastFeature).to.be.an("object").and.not.to.be.null;
        });
    });
});
