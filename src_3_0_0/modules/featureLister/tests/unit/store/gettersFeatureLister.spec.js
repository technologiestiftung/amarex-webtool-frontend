import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersFeatureLister";
import layerCollection from "../../../../../core/layers/js/layerCollection";
const {featureProperties, featureDetails, headers, selectedFeature} = getters;

describe("src_3_0_0/modules/featureLister/store/gettersFeatureLister", () => {
    const gfiFeature1 = {
            id: "1",
            getAttributesToShow: () => "showAll",
            getProperties: () => ({generic: "Hallo", alpha: "Dies", beta: "ist", gamma: "ein", delta: "Test"})
        },
        gfiFeature2 = {
            id: "2",
            getAttributesToShow: () => ({generic: "Show Generic", alpha: "Show Alpha"}),
            getProperties: () => ({generic: "Test", alpha: "ohne", beta: "Gamma und Delta"})
        },
        gfiFeature3 = {
            id: "3",
            getAttributesToShow: () => ({generic: "Show Generic", beta: "Show Beta"}),
            getProperties: () => ({generic: "Test", alpha: "ohne", beta: "", gamma: "Delta"})
        },
        listOfHeaders = {
            mapHeaders: (list) => Object.fromEntries(list.map(({key, value}) => [key, value]))
        };

    let state;

    beforeEach(() => {
        state = {
            selectedFeatureIndex: 0,
            gfiFeaturesOfLayer: [gfiFeature1, gfiFeature2, gfiFeature3, {id: "4.1"}, {id: "4.2"}],
            layer: {id: "id"}
        };
        sinon.stub(layerCollection, "getLayerById").returns(
            {
                getLayerSource: () => {
                    return {
                        getFeatures: () => {
                            return state.gfiFeaturesOfLayer;
                        },
                        getFeatureById: (id) => {
                            return state.gfiFeaturesOfLayer.find(f => f.id === id);
                        }
                    };
                }
            }
        );
    });

    afterEach(sinon.restore);

    describe("selectedFeature", () => {
        it("returns the feature at index 0", () => {
            expect(selectedFeature(state)(0)).to.be.deep.equal(gfiFeature1);
        });
        it("returns the feature at index 1", () => {
            expect(selectedFeature(state)(1)).to.be.deep.equal(gfiFeature2);
        });
        it("returns nested feature", () => {
            expect(selectedFeature(state)(3)).to.be.deep.equal({id: "4.1"});
        });
    });

    describe("headers", () => {
        it("lists all used attributes", () => {
            state.gfiFeaturesOfLayer = [gfiFeature2, gfiFeature3];
            expect(listOfHeaders.mapHeaders(headers(state, {}, {}, {ignoredKeys: []}))).to.deep.equal({generic: "Show Generic", alpha: "Show Alpha", beta: "Show Beta"});
        });
        it("shows all properties with showAll feature", () => {
            state.gfiFeaturesOfLayer = [gfiFeature1, gfiFeature2];
            expect(Object.keys(listOfHeaders.mapHeaders(headers(state, {}, {}, {ignoredKeys: []})))).to.deep.equal(["generic", "alpha", "beta", "gamma", "delta"]);
        });
        it("header value as object, use name as value", () => {
            const gfiFeature = {
                getAttributesToShow: () => ({
                    generic: "Show Generic",
                    alpha: {
                        "name": "Name Von Alpha",
                        "condition": "contains",
                        "type": "date",
                        "format": "MM.DD.YYYY"
                    }
                }),
                getProperties: () => ({generic: "Test", alpha: "01.01.2022"})
            };

            state.gfiFeaturesOfLayer = [gfiFeature];
            expect(listOfHeaders.mapHeaders(headers(state, {}, {}, {ignoredKeys: []}))).to.deep.equal({generic: "Show Generic", alpha: "Name Von Alpha"});
        });
    });

    describe("featureDetails", () => {
        const mapFeatureDetails = Object.fromEntries;

        it("returns the exactly the attribute titles and values that are to show", () => {
            state.selectedFeatureIndex = 1;
            expect(mapFeatureDetails(featureDetails(state, {}, {}, {ignoredKeys: []}))).to.deep.equal({"Show Generic": "Test", "Show Alpha": "ohne"});
        });
        it("returns all attribute values if showAll is set", () => {
            state.selectedFeatureIndex = 0;
            expect(mapFeatureDetails(featureDetails(state, {}, {}, {ignoredKeys: []}))).to.deep.equal(gfiFeature1.getProperties());
        });
        it("ignores globally hidden keys if showAll is set", () => {
            state.selectedFeatureIndex = 0;
            expect(mapFeatureDetails(featureDetails(state, {}, {}, {ignoredKeys: ["ALPHA", "BETA", "GAMMA", "DELTA"]}))).to.deep.equal({generic: "Hallo"});
        });
        it("ignores false-ish values", () => {
            state.selectedFeatureIndex = 2;
            expect(mapFeatureDetails(featureDetails(state, {}, {}, {ignoredKeys: []}))).to.deep.equal({"Show Generic": "Test"});
        });
    });

    describe("featureProperties", () => {
        it("returns a nested array with equal length for each row", () => {
            state.headers = ["generic", "gamma"].map(it => ({key: it, value: "The " + it}));
            state.gfiFeaturesOfLayer = [gfiFeature2, gfiFeature3];
            expect(featureProperties(state)).to.deep.equal([["Test", ""], ["Test", "Delta"]]);
        });
    });
});
