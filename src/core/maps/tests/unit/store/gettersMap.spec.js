import {expect} from "chai";
import Map from "ol/Map.js";
import gettersMap from "../../../store/gettersMap";
import mutationsMap from "../../../store/mutationsMap";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const {addLayerToMap} = mutationsMap;

describe("src/core/maps/store/gettersMap.js", () => {

    describe("Map simple getters", async () => {
        it("returns the 2D map", () => {
            const map = {
                id: "ol",
                mode: "2D"
            };

            mapCollection.clear();
            mapCollection.addMap(map, "2D");

            expect(mapCollection.getMap("2D")).to.deep.equal({id: "ol", mode: "2D"});
        });
        it("returns the 3D map", () => {
            const map = {
                id: "olcs",
                mode: "3D"
            };

            mapCollection.addMap(map, "3D");

            expect(mapCollection.getMap("3D")).to.deep.equal({id: "olcs", mode: "3D"});
        });
        it("returns the map layers", () => {
            const layers = [],
                map = {
                    id: "ol",
                    mode: "2D",
                    addLayer: (layer) => {
                        layers.push(layer);
                    },
                    getLayers: () => {
                        return layer;
                    }
                },
                layer = new VectorLayer({
                    name: "layer123",
                    source: new VectorSource()
                }),
                state = {
                    mode: "2D"
                };

            mapCollection.clear();
            mapCollection.addMap(map, "2D");
            addLayerToMap(state, layer);

            expect(gettersMap.getLayers().values_.name).to.equals("layer123");
        });
    });

    describe("Map custom getters", () => {
        it("returns the visibleLayerList", () => {
            const map = new Map({
                id: "ol",
                mode: "2D"
            });

            mapCollection.clear();
            mapCollection.addMap(map, "2D");
            expect(gettersMap.getVisibleLayerList()).to.be.a("array");
        });
    });

    describe("test getters from mapView", () => {
        /**
         * Is needed to run the tests.
         * @see https://github.com/vuejs/vue-test-utils/issues/974
         * @returns {void}
         */
        global.requestAnimationFrame = () => "";

        let map, size;

        beforeEach(() => {
            mapCollection.clear();
            size = [1920, 887];
            map = new Map({
                id: "ol",
                mode: "2D",
                view: new View({
                    extent: [510000.0, 5850000.0, 625000.4, 6000000.0],
                    center: [565874, 5934140],
                    zoom: 2,
                    options: [
                        {resolution: 66.14579761460263, scale: 250000, zoomLevel: 0},
                        {resolution: 26.458319045841044, scale: 100000, zoomLevel: 1},
                        {resolution: 15.874991427504629, scale: 60000, zoomLevel: 2},
                        {resolution: 10.583327618336419, scale: 40000, zoomLevel: 3},
                        {resolution: 5.2916638091682096, scale: 20000, zoomLevel: 4},
                        {resolution: 2.6458319045841048, scale: 10000, zoomLevel: 5},
                        {resolution: 1.3229159522920524, scale: 5000, zoomLevel: 6},
                        {resolution: 0.6614579761460262, scale: 2500, zoomLevel: 7},
                        {resolution: 0.2645831904584105, scale: 1000, zoomLevel: 8},
                        {resolution: 0.1322915952292052, scale: 500, zoomLevel: 9}
                    ],
                    resolution: 15.874991427504629,
                    resolutions: [66.14579761460263, 26.458319045841044, 15.874991427504629, 10.583327618336419, 5.2916638091682096, 2.6458319045841048, 1.3229159522920524, 0.6614579761460262, 0.2645831904584105, 0.13229159522920522]
                })
            });

            map.setSize(size);
            mapCollection.addMap(map, "2D");
        });

        it("getCurrentExtent - calculate the extent for the current view state and the passed size", function () {
            const state = {size: size};

            expect(gettersMap.getCurrentExtent(state)).to.deep.equal([
                550634.0082295956, 5927099.441301902, 581113.9917704044, 5941180.558698098
            ]);

            map.getView().setZoom(3);
            expect(gettersMap.getCurrentExtent(state)).to.not.have.members([
                550634.0082295956, 5927099.441301902, 581113.9917704044, 5941180.558698098
            ]);
        });
    });

    describe("getLayerById", () => {
        beforeEach(() => {
            mapCollection.clear();

            const map = new Map({
                    id: "ol",
                    mode: "2D"
                }),
                layer1 = new VectorLayer({
                    id: "1",
                    name: "ABC",
                    source: new VectorSource()
                }),
                layer2 = new VectorLayer({
                    id: "2",
                    name: "ABC",
                    source: new VectorSource()
                });

            map.addLayer(layer1);
            map.addLayer(layer2);

            mapCollection.addMap(map, "2D");
        });

        it("should return the layer with the id 1", () => {
            const layerId = "1",
                foundLayer = gettersMap.getLayerById()({layerId});

            expect(foundLayer.get("id")).to.equals("1");
            expect(foundLayer).to.be.an.instanceof(VectorLayer);
        });
    });
});
