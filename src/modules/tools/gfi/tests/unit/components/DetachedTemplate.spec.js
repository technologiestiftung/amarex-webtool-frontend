import Vuex from "vuex";
import {config, mount, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import DetachedTemplate from "../../../components/templates/DetachedTemplate.vue";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";

const localVue = createLocalVue();

config.mocks.$t = key => key;
localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/DetachedTemplate.vue", () => {
    let store,
        highlightVectorRules,
        getLayerByIdSpy,
        highlightFeatureSpy,
        removeHighlightFeatureSpy;
    const mockMutations = {
            setCurrentFeature: () => sinon.stub(),
            setShowMarker: () => SVGTextPositioningElement.stub()
        },
        mockGetters = {
            centerMapToClickPoint: () => sinon.stub(),
            showMarker: () => sinon.stub(),
            highlightVectorRules: () => highlightVectorRules,
            currentFeature: () => sinon.stub()
        },
        olFeature = new Feature({
            name: "feature123"
        });

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D"
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        olFeature.setId("feature1");
        olFeature.setGeometry(new Point([10, 10]));
        getLayerByIdSpy = sinon.spy();
        highlightFeatureSpy = sinon.spy();
        removeHighlightFeatureSpy = sinon.spy();
        highlightVectorRules = {
            image: {
                scale: 10
            },
            fill: sinon.stub(),
            stroke: sinon.stub()
        };
        store = getStore();
    });

    /**
     * Creates test store.
     * @returns {Object} the test store
     */
    function getStore () {
        return new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Gfi: {
                            namespaced: true,
                            mutations: mockMutations,
                            getters: mockGetters
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        removeHighlightFeature: removeHighlightFeatureSpy,
                        highlightFeature: highlightFeatureSpy,
                        setCenter: sinon.stub()
                    },
                    getters: {
                        clickCoordinate: sinon.stub(),
                        getLayerById: () => getLayerByIdSpy
                    }
                },
                MapMarker: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub(),
                        placingPointMarker: sinon.stub()
                    }
                }
            }
        });
    }

    it("should have a close button", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.find("span.bootstrap-icon > .bi-x-lg").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            }),
            button = wrapper.find("span.bootstrap-icon > .bi-x-lg");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            }),
            modal = wrapper.find(".vue-tool-content-body");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });
});
