import {expect} from "chai";
import sinon from "sinon";
import TerrainLayer from "../../terrain";
import store from "../../../../app-store";

describe("src/core/layers/terrain.js", () => {
    let attributes, map3D, cesiumTerrainProviderSpy, cesiumEllipsoidTerrainProviderSpy, fromUrlSpy;

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
            }
        };

        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return {};
            }
        };
        mapCollection.addMap(map, "2D");
        mapCollection.addMap(map3D, "3D");
    });
    beforeEach(() => {
        global.Cesium = {};
        global.Cesium.CesiumTerrainProvider = () => { /* no content*/ };
        global.Cesium.EllipsoidTerrainProvider = () => { /* no content*/ };
        global.Cesium.CesiumTerrainProvider.fromUrl = () => sinon.stub();
        attributes = {
            name: "terrainTestLayer",
            id: "id",
            typ: "Terrain3D",
            cesiumTerrainProviderOptions: {
                requestVertexNormals: true
            },
            url: "https://example.com",
            isSelected: false
        };
        cesiumTerrainProviderSpy = sinon.spy(global.Cesium, "CesiumTerrainProvider");
        cesiumEllipsoidTerrainProviderSpy = sinon.spy(global.Cesium, "EllipsoidTerrainProvider");
        fromUrlSpy = sinon.spy(global.Cesium.CesiumTerrainProvider, "fromUrl");
        store.state.Maps.mode = "3D";
        store.getters = {
            "Maps/mode": store.state.Maps.mode
        };
    });

    afterEach(() => {
        sinon.restore();
        global.Cesium = null;
        store.state.Maps.mode = "2D";
    });

    /**
     * Checks the layer for attributes content.
     * @param {Object} layer the layer
     * @param {Object} terrainLayer the terrainLayer
     * @param {Object} attrs the attributes
     * @returns {void}
     */
    function checkLayer (layer, terrainLayer, attrs) {
        expect(layer).not.to.be.undefined;
        expect(terrainLayer.get("name")).to.be.equals(attrs.name);
        expect(terrainLayer.get("id")).to.be.equals(attrs.id);
        expect(terrainLayer.get("typ")).to.be.equals(attrs.typ);
    }

    it("setVisible shall call setIsSelected", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer"),
            setIsSelectedSpy = sinon.spy(TerrainLayer.prototype, "setIsSelected");

        terrainLayer.setVisible(true);
        checkLayer(layer, terrainLayer, attributes);
        expect(setIsSelectedSpy.calledOnce).to.equal(true);
        expect(setIsSelectedSpy.calledWithMatch(true)).to.equal(true);
    });
    it("setIsSelected true shall create cesiumTerrainProvider", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        terrainLayer.setIsSelected(true);
        checkLayer(layer, terrainLayer, attributes);
        expect(fromUrlSpy.calledOnce).to.equal(true);
        expect(fromUrlSpy.calledWithMatch("https://example.com", {})).to.equal(true);
        expect(cesiumEllipsoidTerrainProviderSpy.notCalled).to.equal(true);
    });
    it("setIsSelected false shall create ellipsoidTerrainProvider", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        terrainLayer.setIsSelected(false);
        checkLayer(layer, terrainLayer, attributes);
        expect(cesiumEllipsoidTerrainProviderSpy.calledOnce).to.equal(true);
        expect(fromUrlSpy.notCalled).to.equal(true);
    });
    it("setIsVisibleInMap to true shall set isVisibleInMap", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        terrainLayer.setIsVisibleInMap(true);
        checkLayer(layer, terrainLayer, attributes);
        expect(terrainLayer.get("isVisibleInMap")).to.equal(true);
        expect(cesiumEllipsoidTerrainProviderSpy.notCalled).to.equal(true);
        expect(fromUrlSpy.calledOnce).to.equal(true);
    });
    it("setIsVisibleInMap to false shall set isVisibleInMap and hide layer", function () {
        const terrainLayer = new TerrainLayer(attributes),
            layer = terrainLayer.get("layer");

        checkLayer(layer, terrainLayer, attributes);
        terrainLayer.setIsVisibleInMap(false);
        expect(terrainLayer.get("isVisibleInMap")).to.equal(false);
        expect(cesiumEllipsoidTerrainProviderSpy.calledOnce).to.equal(true);
        expect(fromUrlSpy.notCalled).to.equal(true);
    });
});


