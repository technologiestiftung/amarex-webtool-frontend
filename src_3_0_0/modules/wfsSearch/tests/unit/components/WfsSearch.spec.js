import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import requestProvider from "../../../js/requests";

import WfsSearchLiteral from "../../../components/WfsSearchLiteral.vue";
import WfsSearch from "../../../components/WfsSearch.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/wfsSearch/components/WfsSearch.vue", () => {
    const mockMapMarkerActions = {
            removePointMarker: sinon.stub(),
            placingPointMarker: sinon.stub()
        },
        mockAlertingActions = {
            addSingleAlert: sinon.stub()
        };

    let instances,
        store,
        layer;

    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            updateSize: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");

        instances = [{
            title: "Test WfsSearch",
            requestConfig: {
                layerId: "753"
            },
            resultList: {
                Ort: "Ort",
                Name: "Name"
            },
            literals: [{field: {
                id: "fieldId",
                queryType: "like",
                inputLabel: "Name",
                fieldName: "Name"
            }}]
        }];
        layer = {
            id: "753"
        };
        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        WfsSearch: WfsSearchModule,
                        Language: {
                            namespaced: true,
                            getters: {
                                currentLocale: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: mockMapMarkerActions
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions
                }
            },
            getters: {
                uiStyle: sinon.stub(),
                layerConfigById: () => () => layer
            }
        });
    });
    afterEach(sinon.restore);

    it("renders a literal", async () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent(WfsSearchLiteral).exists()).to.be.true;
    });
    it("renders multiple literals if configured", () => {
        instances[0].literals.push({field: {
            id: "fieldId2",
            queryType: "like",
            inputLabel: "Name2",
            fieldName: "Name2"
        }}, {field: {
            id: "fieldId3",
            queryType: "like",
            inputLabel: "Name3",
            fieldName: "Name3"
        }});
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAllComponents(WfsSearchLiteral).length).to.equal(3);
    });
    it("renders a select field to select the searchInstance if configured", () => {
        instances.push({
            title: "Test WfsSearch II",
            literals: [{}]
        });
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-wfsSearch-instances-select-label").exists()).to.be.true;
        expect(wrapper.find("#module-wfsSearch-instances-select").exists()).to.be.true;
    });
    it("renders a container with userHelp if configured", () => {
        store.commit("Modules/WfsSearch/setUserHelp", "test");
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-wfsSearch-userHelp").exists()).to.be.true;
        expect(wrapper.find("#module-wfsSearch-userHelp-icon").exists()).to.be.true;
        expect(wrapper.find("#module-wfsSearch-userHelp-text").exists()).to.be.true;
    });
    it("renders a button to reset the UI", () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            }),
            resetButton = wrapper.find("#module-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.true;
        expect(resetButton.text()).to.equal("common:modules.wfsSearch.resetButton");
    });
    it("does not render a button to reset the UI if prop showResetButton is set to false", () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                },
                props: {
                    showResetButton: false
                }
            }),
            resetButton = wrapper.find("#module-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.false;
    });
    it("renders an input element of type submit to search", () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            }),
            searchInput = wrapper.find("#module-wfsSearch-button-search");

        expect(searchInput.exists()).to.be.true;
        expect(searchInput.element.type).to.equal("submit");
    });
    it.skip("renders a clickable button to show the search results if the user searched and results were found", async () => {
        store.commit("Modules/WfsSearch/setInstances", instances);

        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });
        let showResultsButton = null;

        store.commit("Modules/WfsSearch/setSearched", true);
        store.commit("Modules/WfsSearch/setResults", [{Ort: "Hamburg", Name: "KiTa Rübennasen"}]);
        await wrapper.vm.$nextTick();
        showResultsButton = wrapper.find("#module-wfsSearch-button-showResults");
        showResultsButton.element.disabled = false;

        expect(showResultsButton.exists()).to.be.true;
        expect(showResultsButton.text()).to.equal("common:modules.wfsSearch.showResults (1)");
        expect(showResultsButton.element.disabled).to.be.false;
    });
    it("renders a disabled button if the user searched and no results were found", async () => {
        store.commit("Modules/WfsSearch/setInstances", instances);

        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });
        let searchButton = null;

        store.commit("Modules/WfsSearch/setSearched", true);
        store.commit("Modules/WfsSearch/setResults", []);
        await wrapper.vm.$nextTick();
        searchButton = wrapper.find("#module-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.true;
        expect(searchButton.text()).to.equal("common:modules.wfsSearch.showResults (0)");
        expect(searchButton.element.disabled).to.be.true;
    });
    it("renders no button if the user searched but the parameter 'resultList' was not configured", () => {
        store.commit("Modules/WfsSearch/setSearched", true);
        store.commit("Modules/WfsSearch/setResults", [{}]);
        delete instances[0].resultList;
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            }),
            searchButton = wrapper.find("#module-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.false;
    });

    it("sets zoom according to prop if set", async () => {
        const features = [
                {
                    getGeometry () {
                        return {
                            getCoordinates () {
                                return undefined;
                            }
                        };
                    }
                }
            ],
            wrapper = mount(WfsSearch, {
                props: {
                    zoomLevelProp: 1
                },
                global: {
                    plugins: [store]
                }
            }),
            setZoomStub = sinon.stub(wrapper.vm, "setZoom");

        sinon.stub(requestProvider, "searchFeatures").returns(features);
        sinon.stub(wrapper.vm, "setCenter");

        wrapper.vm.setZoomLevel(99);

        await wrapper.vm.search();

        expect(setZoomStub.calledWith(1)).to.be.true;
    });
    it("sets zoom according to config/store if no such prop set", async () => {
        const features = [
                {
                    getGeometry () {
                        return {
                            getCoordinates () {
                                return undefined;
                            }
                        };
                    }
                }
            ],
            wrapper = mount(WfsSearch, {
                props: {
                    zoomLevelProp: undefined
                },
                global: {
                    plugins: [store]
                }
            }),
            setZoomStub = sinon.stub(wrapper.vm, "setZoom");

        sinon.stub(requestProvider, "searchFeatures").returns(features);
        sinon.stub(wrapper.vm, "setCenter");

        wrapper.vm.setZoomLevel(99);

        await wrapper.vm.search();

        expect(setZoomStub.calledWith(99)).to.be.true;
    });
});
