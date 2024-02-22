import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";

import WmsTimeComponent from "../../../components/WmsTime.vue";
import LayerSwiper from "../../../components/LayerSwiper.vue";
import TimeSlider from "../../../components/TimeSlider.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/wmsTime/components/WmsTime.vue", () => {
    let store,
        timeSliderActive,
        layerSwiperActive,
        winWidth;

    beforeEach(() => {
        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        WmsTime: {
                            namespaced: true,
                            getters: {
                                timeRange: () => sinon.spy(),
                                minWidth: () => {
                                    return winWidth > 800;
                                },
                                layerSwiper: () => {
                                    return {
                                        active: layerSwiperActive,
                                        isMoving: false,
                                        swiper: null,
                                        targetLayer: null,
                                        sourceLayer: null,
                                        valueX: null
                                    };
                                },
                                timeSlider: () => {
                                    return {
                                        active: timeSliderActive,
                                        currentLayerId: "",
                                        objects: [],
                                        playbackDelay: 1,
                                        playing: false
                                    };
                                },
                                currentTimeSliderObject: () => {
                                    return {
                                        layerId: "sesamLayer"
                                    };
                                },
                                layerAppendix: () => {
                                    return "_oskarTonne";
                                }
                            },
                            actions: {
                                updateMap: sinon.spy(),
                                toggleSwiper: sinon.spy()
                            },
                            mutations: {
                                setWindowWidth: (number) => {
                                    winWidth = number;
                                },
                                setTimeSliderActive: (active) => {
                                    timeSliderActive = active;
                                },
                                setLayerSwiperActive: (active) => {
                                    layerSwiperActive = active;
                                },
                                setTimeSliderPlaying: sinon.stub()
                            }
                        }
                    }
                }
            }
        });
        timeSliderActive = false;
        layerSwiperActive = false;
        winWidth = 801;
    });

    afterEach(() => {
        winWidth = 1024;
        timeSliderActive = false;
        layerSwiperActive = false;
        sinon.restore();
    });

    it("render one TimeSlider component if it is active and the layerSwiper is inactive", () => {
        timeSliderActive = true;
        const wrapper = shallowMount(WmsTimeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.findAllComponents(TimeSlider).length).to.equal(1);
        expect(wrapper.findComponent(LayerSwiper).exists()).to.be.false;
    });
    it("render two TimeSlider component and a LayerSwiper component if the timeSlider is active, the layerSwiper is active and the window has a minWidth of 800px", () => {
        timeSliderActive = true;
        layerSwiperActive = true;
        const wrapper = shallowMount(WmsTimeComponent, {
                global: {
                    plugins: [store]
                }}),
            timeSliderComponents = wrapper.findAllComponents(TimeSlider);

        expect(timeSliderComponents.length).to.equal(2);
        expect(timeSliderComponents.at(0).element.className).to.equal("moveLeft");
        expect(timeSliderComponents.at(1).element.className).to.equal("moveRight");
        expect(wrapper.findComponent(LayerSwiper).exists()).to.be.true;
    });
    it("should only render one TimeSlider component and no LayerSwiper component if the window size is smaller than the minWidth of 800px", () => {
        timeSliderActive = true;
        layerSwiperActive = true;
        winWidth = 799;
        const wrapper = shallowMount(WmsTimeComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.findAllComponents(TimeSlider).length).to.equal(1);
        expect(wrapper.findComponent(LayerSwiper).exists()).to.be.false;
    });
});
