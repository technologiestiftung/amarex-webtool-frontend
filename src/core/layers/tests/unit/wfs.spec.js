import Map from "ol/Map";
import View from "ol/View";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {expect} from "chai";
import sinon from "sinon";
import WfsLayer from "../../wfs";
import store from "../../../../app-store";
import {Style} from "ol/style.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle.js";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import webgl from "../../renderer/webgl";

describe("src/core/layers/wfs.js", () => {
    const consoleWarn = console.warn;
    let attributes;

    before(() => {
        mapCollection.clear();
        const map = new Map({
            id: "ol",
            mode: "2D",
            view: new View(),
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            // addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        });

        mapCollection.addMap(map, "2D");
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        sinon.stub(console, "error");

        attributes = {
            url: "https://url.de",
            name: "wfsTestLayer",
            id: "id",
            typ: "wfs",
            version: "2.0.0",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false,
            featureNS: "http://www.deegree.org/app",
            featureType: "krankenhaeuser_hh"
        };
        store.getters = {
            treeType: "custom"
        };
        console.warn = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.warn = consoleWarn;
    });

    describe("createLayer", () => {
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = true;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(wfsLayer.get("isVisibleInMap")).to.be.true;
            expect(wfsLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=false shall set layer not visible", function () {
            attributes.isSelected = false;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(wfsLayer.get("isVisibleInMap")).to.be.false;
            expect(wfsLayer.get("layer").getVisible()).to.be.false;
        });
    });

    describe("getPropertyname", () => {
        it("getPropertyname shall return joined proertyNames or empty string", function () {
            attributes.propertyNames = ["app:plan", "app:name"];
            const wfsLayer = new WfsLayer(attributes);
            let propertyname = wfsLayer.getPropertyname(attributes);

            expect(propertyname).to.be.equals("app:plan,app:name");

            attributes.propertyNames = [];
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
        });
    });
    describe("updateSource", () => {
        it("updateSource shall refresh source if 'sourceUpdated' is false", function () {
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(wfsLayer.get("sourceUpdated")).to.be.false;
            wfsLayer.updateSource();
            expect(spy.calledOnce).to.be.true;
            expect(wfsLayer.get("sourceUpdated")).to.be.true;
        });
        it("updateSource shall not refresh source if 'sourceUpdated' is true", function () {
            attributes.sourceUpdated = true;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(wfsLayer.get("sourceUpdated")).to.be.true;
            wfsLayer.updateSource();
            expect(spy.notCalled).to.be.true;
            expect(wfsLayer.get("sourceUpdated")).to.be.true;
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
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            wfsLayer.hideAllFeatures();

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
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
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(createStyle, "createStyle").returns(new Style());
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromWFS").returns(new Promise(resolve => {
                resolve({});
            }));
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            wfsLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            wfsLayer.showAllFeatures();

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("object");
            expect(style1).not.to.be.null;
            expect(typeof style2).to.be.equals("object");
            expect(style2).not.to.be.null;
            expect(typeof style3).to.be.equals("object");
            expect(style3).not.to.be.null;

        });
        it("showFeaturesByIds", function () {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(createStyle, "createStyle").returns(new Style());
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromWFS").returns(new Promise(resolve => {
                resolve({});
            }));

            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear");

            wfsLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            wfsLayer.showFeaturesByIds(["1"]);

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
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
        it("getStyleAsFunction shall return a function", function () {
            const wfsLayer = new WfsLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = wfsLayer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = wfsLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const wfsLayer = new WfsLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            wfsLayer.set("style", styleFn);

            wfsLayer.styling();
            expect(typeof wfsLayer.get("layer").getStyle()).to.be.equals("function");
            expect(wfsLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const
                geojsonLayer = new WfsLayer({...attributes, renderer: "webgl"}),
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
