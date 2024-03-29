import {expect} from "chai";
import Map from "ol/Map";
import sinon from "sinon";
import VectorBaseLayer from "../../vectorBase";

describe("src/core/layers/vectorBase.js", () => {
    let attributes;

    before(() => {
        mapCollection.clear();
        const map = new Map({
            id: "ol",
            mode: "2D"
        });

        mapCollection.addMap(map, "2D");
    });
    beforeEach(() => {
        attributes = {
            name: "vectorBaseTestLayer",
            id: "id",
            typ: "VectorBase",
            isSelected: false,
            features: []
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("createLayer shall create an ol.Layer with source", function () {
        const Layer = new VectorBaseLayer(attributes),
            layer = Layer.get("layer");

        expect(layer).not.to.be.undefined;
        expect(layer.getSource()).not.to.be.undefined;
    });

    it("updateSource shall update source", function () {
        const baseLayer = new VectorBaseLayer(attributes),
            layer = baseLayer.get("layer"),
            spy = sinon.spy(layer.getSource(), "refresh");

        expect(baseLayer.get("sourceUpdated")).to.be.false;
        baseLayer.updateSource();
        expect(spy.calledOnce).to.be.true;
        expect(baseLayer.get("sourceUpdated")).to.be.true;
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

        it("hideAllFeatures", function () {
            const layer = new VectorBaseLayer(attributes),
                olLayer = layer.get("layer"),
                clearStub = sinon.stub(olLayer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(olLayer.getSource(), "addFeatures");

            sinon.stub(olLayer.getSource(), "getFeatures").returns(features);

            layer.hideAllFeatures();

            expect(layer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledOnce).to.be.true;
            expect(addFeaturesStub.calledOnce).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;

        });
        it("showAllFeatures", function () {
            const layer = new VectorBaseLayer(attributes),
                olLayer = layer.get("layer");

            sinon.stub(olLayer.getSource(), "getFeatures").returns(features);
            layer.showAllFeatures();

            expect(layer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(style1).to.be.equals(undefined);
            expect(style2).to.be.equals(undefined);
            expect(style3).to.be.equals(undefined);

        });
        it("showFeaturesByIds", function () {
            const layer = new VectorBaseLayer(attributes),
                olLayer = layer.get("layer"),
                clearStub = sinon.stub(olLayer.getSource(), "clear");

            sinon.stub(olLayer.getSource(), "addFeatures");
            sinon.stub(olLayer.getSource(), "getFeatures").returns(features);
            sinon.stub(olLayer.getSource(), "getFeatureById").returns(features[0]);
            layer.showFeaturesByIds(["1"]);

            expect(layer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(style1).to.be.equals(undefined);
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
            expect(clearStub.calledOnce).to.be.true;
        });
    });

    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", function () {
            const layer = new VectorBaseLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = layer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = layer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const layer = new VectorBaseLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            layer.set("style", styleFn);

            layer.styling();
            expect(typeof layer.get("layer").getStyle()).to.be.equals("function");
            expect(layer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
});
