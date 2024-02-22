import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import OrientationItemComponent from "../../../components/OrientationItem.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/controls/orientation/components/OrientationItem.vue", () => {
    let store;
    const mockAlertingActions = {
        addSingleAlert: sinon.stub()
    };

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Orientation: {
                            namespaced: true,
                            getters: {
                                geolocation: sinon.stub(),
                                iconGeolocate: sinon.stub(),
                                iconGeolocatePOI: sinon.stub(),
                                poiDistances: () => [],
                                poiMode: sinon.stub(),
                                poiModeCurrentPositionEnabled: sinon.stub(),
                                showPoi: sinon.stub(),
                                showPoiChoice: sinon.stub(),
                                showPoiIcon: sinon.stub(),
                                zoomMode: sinon.stub()
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions

                }
            },
            getters: {
                visibleLayerConfigs: sinon.stub()
            }
        });
    });

    after(() => {
        sinon.restore();
    });

    it("renders the Orientation component", () => {
        const wrapper = mount(OrientationItemComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find(".orientationButtons").exists()).to.be.true;
        expect(wrapper.find("#geolocation_marker").exists()).to.be.true;
    });

    it("renders the Orientation button", () => {
        const wrapper = mount(OrientationItemComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#geolocate").exists()).to.be.true;
    });

    it("will not render the Poi Orientation button", () => {
        const wrapper = mount(OrientationItemComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#geolocatePOI").exists()).to.be.false;
    });

    it("will union the array", () => {
        const wrapper = mount(OrientationItemComponent, {
                global: {
                    plugins: [store]
                }}),
            arr1 = [3, 3, 4],
            arr2 = [5, 6, 7],
            arr = [3, 4, 5, 6, 7];

        expect(wrapper.vm.union(arr1, arr2, (obj1, obj2) => obj1 === obj2)).to.deep.equal(arr);
    });

});
