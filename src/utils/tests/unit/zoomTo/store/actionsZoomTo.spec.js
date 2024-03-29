import axios from "axios";
import {expect} from "chai";
import sinon from "sinon";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle.js";
import VectorLayer from "ol/layer/Vector";
import actions from "../../../../zoomTo/store/actionsZoomTo";

const fs = require("fs"),
    exampleFeatureCollection = fs.readFileSync("./src/utils/tests/unit/zoomTo/resources/featureCollection.xml", "utf8"),
    districtFeatures = fs.readFileSync("./src/utils/tests/unit/zoomTo/resources/districtFeatures.xml", "utf8"),
    idDistrictLayer = "1692",
    id = "someId";

/**
 * Fakes the return of a successful axios get request.
 *
 * @returns {Promise<{data: string, status: number}>} Status code and a FeatureCollection in XML.
 */
function axiosFake () {
    return new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection}));
}
/**
 * Fakes the return of a successful axios district get request.
 *
 * @returns {Promise<{data: string, status: number}>} Status code and a FeatureCollection in XML.
 */
function axiosDistrictFake () {
    return new Promise(resolve => resolve({status: 200, statusText: "OK", data: districtFeatures}));
}

describe("src/utils/zoomTo/store/actionsZoomTo.js", () => {
    describe("zoomToFeatures", () => {
        const styleObject = {
            styleId: "zoomToGeometry",
            rules: [{
                style: {
                    type: "circle",
                    circleFillColor: [255, 255, 0, 0.9],
                    circleRadius: 8,
                    circleStrokeColor: [0, 0, 0, 1],
                    circleStrokeWidth: 2
                }
            }]
        };
        let consoleErrorSpy,
            consoleWarnSpy,
            dispatch,
            getters,
            state;

        beforeEach(() => {
            consoleErrorSpy = sinon.spy();
            consoleWarnSpy = sinon.spy();
            dispatch = sinon.spy();
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);
            getters = {
                config: {},
                deprecatedParameters: false
            };
            state = {};
            rawLayerList.getLayerList().push({id, url: "", version: "", featureType: ""});
            rawLayerList.getLayerList().push({id: idDistrictLayer, url: "", version: "", featureType: ""});
        });
        afterEach(() => {
            sinon.restore();
            rawLayerList.getLayerList().length = 0;
        });
        // NOTE: The following 5 tests should be removed in v3.0.0
        it("should log an error and return if a deprecated configuration parameter is used and a zoomToFeature url parameter is used without valid configuration", () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            state.zoomToFeatureId = "something";
            actions.zoomToFeatures({state, getters, dispatch})
                .catch(error => {
                    expect(consoleWarnSpy.calledOnce).to.be.true;
                    expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
                    expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
                    expect(error).to.equal("zoomTo: A mismatch between url parameters and configuration occurred.");
                });
        });
        it("should log an error and return if a deprecated configuration parameter is used and a zoomToGeometry url parameter is used without valid configuration", () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            state.zoomToGeometry = "something";
            actions.zoomToFeatures({state, getters, dispatch})
                .catch(error => {
                    expect(consoleWarnSpy.calledOnce).to.be.true;
                    expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
                    expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
                    expect(error).to.equal("zoomTo: A mismatch between url parameters and configuration occurred.");
                });
        });
        it("should zoom to district, if zoomToGeometry is a number", async () => {
            sinon.stub(styleList, "returnStyleObject").returns(styleObject);
            sinon.stub(axios, "get").callsFake(axiosDistrictFake);
            getters.config = [{
                id: "zoomToGeometry",
                layerId: "1692",
                property: "bezirk_name",
                allowedValues: [
                    "ALTONA",
                    "HARBURG",
                    "HAMBURG-NORD",
                    "BERGEDORF",
                    "EIMSBÜTTEL",
                    "HAMBURG-MITTE",
                    "WANDSBEK"
                ]
            }];
            state.zoomToGeometry = "1";
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayerOnTop");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(1);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});

        });
        it("should throw and log an error if an error occurs when trying to fetch features from the service", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            getters.config.zoomToFeature = {
                wfsId: id,
                attribute: "flaechenid",
                styleId: "stylish"
            };
            state.zoomToFeatureId = [18, 26];
            // NOTE: These sinon functions are needed here again to be able to add new behaviour to the axios.get method
            sinon.restore();
            sinon.stub(axios, "get").callsFake(() => new Promise((_, reject) => reject("Custom testing error!")));
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            expect(consoleErrorSpy.calledOnce).to.be.true;
            expect(consoleErrorSpy.firstCall.args.length).to.equal(2);
            expect(consoleErrorSpy.firstCall.args).to.eql(["zoomTo: An error occurred while trying to fetch features from the given service.", "Custom testing error!"]);
        });
        it("should fetch features and call respective vuex store functions if a correct (but deprecated) configuration and url parameter match for zoomToFeature is provided", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            getters.deprecatedParameters = true;
            getters.config.zoomToFeature = {
                wfsId: id,
                attribute: "flaechenid",
                styleId: "stylish"
            };
            state.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({state, getters, dispatch});

            expect(consoleWarnSpy.calledOnce).to.be.true;
            expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
            expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: A deprecated configuration was found. Using it, until it gets removed...");
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayerOnTop");
            expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
            expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(2);
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
            expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
            expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
            expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
            expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
        });
    });
});
