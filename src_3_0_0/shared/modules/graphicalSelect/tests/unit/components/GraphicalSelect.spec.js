import {createStore} from "vuex";
import {shallowMount, config} from "@vue/test-utils";
import {expect} from "chai";
import GraphicalSelectComponent from "../../../components/GraphicalSelect.vue";
import GraphicalSelect from "../../../store/indexGraphicalSelect.js";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

config.global.mocks.$t = key => key;

let store, layersOnMap, layer, mockMapGetters, mockMapActions;

describe("src_3_0_0/shared/modules/graphicalSelect/components/GraphicalSelect.vue", () => {
    GraphicalSelectComponent.props.label = "";
    beforeEach(function () {
        mockMapGetters = {
        };
        mockMapActions = {
            addLayer: sinon.spy(),
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub(),
            registerListener: sinon.stub()
        };
        layersOnMap = [];
        layer = new VectorLayer({
            id: "geometry_selection_layer",
            name: "Geometry-Selection",
            source: new VectorSource(),
            alwaysOnTop: true
        });
        const map = {
            id: "ol",
            mode: "2D",
            addOverlay: sinon.spy(),
            removeOverlay: sinon.spy(),
            getLayers: () => {
                return {
                    getArray: () => layersOnMap
                };
            }
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");

        store = createStore({
            namespaces: true,
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        GraphicalSelect
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters,
                    actions: mockMapActions
                }
            }
        });
    });

    describe("Component DOM", () => {
        it("Dom should exist", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.exists()).to.be.true;
        });

        it("should have a select element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("select").exists()).to.be.true;
            expect(wrapper.find("option").exists()).to.be.true;
            expect(wrapper.find("label").exists()).to.be.true;
        });

        it("the select element of class form-select has at least one option element", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.findAll("select.form-select > option")).to.not.have.lengthOf(0);
        });

        it("options contain only provided draw modus", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {
                global: {
                    plugins: [store]
                }
            });
            let option = {};

            for (option in wrapper.vm.options) {
                expect(wrapper.vm.geographicValues).to.include(option);
            }
        });

        it("should add Layer 1 times to map", () => {
            shallowMount(GraphicalSelectComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(mockMapActions.addLayer.calledOnce).to.be.true;
        });

        it("should add Layer 1 times to map, though createDrawInteraction called 2 times", () => {
            const wrapper = shallowMount(GraphicalSelectComponent, {
                global: {
                    plugins: [store]
                }
            });

            layersOnMap.push(layer);

            wrapper.vm.createDrawInteraction();

            expect(mockMapActions.addLayer.calledOnce).to.be.true;
        });
    });
});
