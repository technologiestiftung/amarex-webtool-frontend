import {expect} from "chai";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import gettersMap from "../../../store/gettersMaps";
import stateMap from "../../../store/stateMaps";
import actions from "../../../store/actionsMapsLayers";

const {
    addLayer
} = actions;

describe("src_3_0_0/core/maps/store/gettersMap.js", () => {
    let layer1,
        layer2,
        layer3,
        olMap;

    before(() => {
        layer1 = new VectorLayer({
            id: "1",
            name: "layer1",
            visible: true,
            source: new VectorSource()
        });
        layer2 = new VectorLayer({
            id: "2",
            name: "layer2",
            visible: true,
            source: new VectorSource()
        });
        layer3 = new VectorLayer({
            id: "3",
            name: "layer3",
            visible: false,
            source: new VectorSource()
        });
    });

    beforeEach(() => {
        olMap = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });
        mapCollection.clear();
        mapCollection.addMap(olMap, "2D");
        addLayer({}, layer1);
        addLayer({}, layer2);
        addLayer({}, layer3);
    });

    describe("getLayerById", () => {
        it("returns layer by id", () => {
            expect(gettersMap.getLayerById()("1")).to.deep.equal(layer1);

        });
    });

    describe("getLayerByName", () => {
        it("returns layer by name", () => {
            expect(gettersMap.getLayerByName()("layer2")).to.deep.equal(layer2);
            expect(gettersMap.getLayerByName()("nameUnknown")).to.equal(undefined);
            expect(gettersMap.getLayerByName()("undefined")).to.equal(undefined);
        });
    });

    describe("isMaxZoomDisplayed", async () => {
        it("returns false for isMaxZoomDisplayed from stateMaps and true for local state", () => {
            const state = {
                maxZoom: 10,
                zoom: 0
            };

            expect(gettersMap.isMaxZoomDisplayed(stateMap)).to.be.true;
            expect(gettersMap.isMaxZoomDisplayed(state)).to.be.false;
        });
    });

    describe("isMinZoomDisplayed", () => {
        it("returns false for isMinZoomDisplayed from stateMaps and true for local state", () => {
            const state = {
                minZoom: 0,
                zoom: 5
            };

            expect(gettersMap.isMinZoomDisplayed(stateMap)).to.be.true;
            expect(gettersMap.isMinZoomDisplayed(state)).to.be.false;
        });
    });
});
