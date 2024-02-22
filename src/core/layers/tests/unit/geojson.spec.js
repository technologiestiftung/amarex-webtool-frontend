import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {expect} from "chai";
import sinon from "sinon";
import Map from "ol/Map";
import GeoJSONLayer from "../../geojson";
import store from "../../../../app-store";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import webgl from "../../renderer/webgl";

describe("src/core/layers/geojson.js", () => {
    const consoleError = console.error;
    let attributes;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(new Map(), "2D");

        attributes = {
            url: "https://urlgeojson.de",
            name: "geojsonTestLayer",
            id: "id",
            typ: "GeoJSON",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false

        };
        store.getters = {
            treeType: "custom"
        };
        console.error = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.error = consoleError;
    });

    describe("createLayer", () => {
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = true;
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(geojsonLayer.get("isVisibleInMap")).to.be.true;
            expect(geojsonLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = false;
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(geojsonLayer.get("isVisibleInMap")).to.be.false;
            expect(geojsonLayer.get("layer").getVisible()).to.be.false;
        });
    });

    describe("check request by using subType", () => {
        it("should throw an error if subType is not supported", function () {
            attributes.subType = "newSubType";
            const geojsonLayer = new GeoJSONLayer(attributes);

            geojsonLayer.expandFeaturesBySubTyp(attributes.subType);
            expect(console.error.called).to.be.true;
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

        it("hideAllFeatures", function () {
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            geojsonLayer.hideAllFeatures();

            expect(geojsonLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
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
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            geojsonLayer.showAllFeatures();

            expect(geojsonLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("undefined");
            expect(typeof style2).to.be.equals("undefined");
            expect(typeof style3).to.be.equals("undefined");
        });
        it("showFeaturesByIds", function () {
            const geojsonLayer = new GeoJSONLayer(attributes),
                layer = geojsonLayer.get("layer");

            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            geojsonLayer.showFeaturesByIds(["1"]);

            expect(geojsonLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
        });
    });
    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", function () {
            const geojsonLayer = new GeoJSONLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = geojsonLayer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = geojsonLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const geojsonLayer = new GeoJSONLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            geojsonLayer.setStyle(styleFn);

            expect(typeof geojsonLayer.get("layer").getStyle()).to.be.equals("function");
            expect(geojsonLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const
                geojsonLayer = new GeoJSONLayer({...attributes, renderer: "webgl"}),
                layer = geojsonLayer.get("layer");

            expect(geojsonLayer.isDisposed).to.equal(webgl.isDisposed);
            expect(geojsonLayer.setIsSelected).to.equal(webgl.setIsSelected);
            expect(geojsonLayer.hideAllFeatures).to.equal(webgl.hideAllFeatures);
            expect(geojsonLayer.showAllFeatures).to.equal(webgl.showAllFeatures);
            expect(geojsonLayer.showFeaturesByIds).to.equal(webgl.showFeaturesByIds);
            expect(geojsonLayer.setStyle).to.equal(webgl.setStyle);
            expect(geojsonLayer.styling).to.equal(webgl.setStyle);
            expect(geojsonLayer.source).to.equal(layer.getSource());
            expect(layer.get("isPointLayer")).to.not.be.undefined;
        });
    });
});
