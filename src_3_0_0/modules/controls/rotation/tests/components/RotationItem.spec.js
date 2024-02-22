import {createStore} from "vuex";
import {expect} from "chai";
import {config, mount, shallowMount} from "@vue/test-utils";
import RotationItemComponent from "../../components/RotationItem.vue";
import Map from "ol/Map";
import sinon from "sinon";
import RotationItem from "../../store/indexRotation";
config.global.mocks.$t = key => key;
describe("src_3_0_0/modules/controls/rotation/components/RotationItem.vue", () => {
    let store,
        wrapper;

    before(() => {
        mapCollection.clear();
        mapCollection.addMap(new Map(), "2D");
    });
    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Rotation: RotationItem
                    }
                }
            },
            getters: {
                controlsConfig: sinon.stub()
            }
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    it("the control renders if rotation is not 0", async () => {
        wrapper = mount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        await wrapper.setData({rotation: 0.1});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
    });
    it("the control renders if showAlways is true", async () => {
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        await store.commit("Controls/Rotation/setShowAlways", true);
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
    });
    it("setToNorth() sets mapView rotation to 0", () => {
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        mapCollection.getMapView("2D").setRotation(4);
        wrapper.vm.setToNorth();
        expect(mapCollection.getMapView("2D").getRotation()).to.eql(0);
    });
});
