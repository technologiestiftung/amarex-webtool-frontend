import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import TimeSlider from "../../../components/TimeSlider.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/wmsTime/components/TimeSlider.vue", () => {
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
                                timeRange: () => {
                                    return ["2020-01-01"];
                                },
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

    it("renders the TimeSlider component without the possibility to activate the the LayerSwiper component if window.innerWidth is below 800", () => {
        winWidth = 799;
        timeSliderActive = true;
        const wrapper = shallowMount(TimeSlider, {
            global: {
                plugins: [store]
            },
            propsData: {layerId: "layerId"}});

        expect(wrapper.find(".timeSlider-innerWrapper-interactions").exists()).to.be.true;
        expect(wrapper.find(".timeSlider-innerWrapper-interactions").element.tagName).to.equal("DIV");
        expect(wrapper.find("#timeSlider-button-backward-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-backward-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-button-play-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-play-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-button-forward-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-forward-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-input-range-layerId-label").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-input-range-layerId-label").element.tagName).to.equal("LABEL");
        expect(wrapper.find("#timeSlider-input-range-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-input-range-layerId").element.tagName).to.equal("INPUT");
    });
    it("renders the TimeSlider component with the possibility to activate the the LayerSwiper component and the text to activate it if it is currently inactive", () => {
        winWidth = 801;
        timeSliderActive = true;
        const wrapper = shallowMount(TimeSlider, {
            global: {
                plugins: [store]
            },
            propsData: {layerId: "layerId"}
        });

        expect(wrapper.find(".timeSlider-innerWrapper-interactions").exists()).to.be.true;
        expect(wrapper.find(".timeSlider-innerWrapper-interactions").element.tagName).to.equal("DIV");
        expect(wrapper.find("#timeSlider-button-backward-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-backward-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-button-play-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-play-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-button-forward-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-forward-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-input-range-layerId-label").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-input-range-layerId-label").element.tagName).to.equal("LABEL");
        expect(wrapper.find("#timeSlider-input-range-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-input-range-layerId").element.tagName).to.equal("INPUT");
        expect(wrapper.find(".timeSlider-innerWrapper").exists()).to.be.true;
        expect(wrapper.find(".timeSlider-innerWrapper").element.tagName).to.equal("DIV");
        expect(wrapper.find("#timeSlider-activate-layerSwiper-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-activate-layerSwiper-layerId").element.tagName).to.equal("FLAT-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-activate-layerSwiper-layerId").attributes("text")).to.equal("common:modules.wmsTime.timeSlider.buttons.layerSwiper");
    });
    it("renders the TimeSlider component with the possibility to activate the the LayerSwiper component and the text to deactivate it if it is currently active", () => {
        winWidth = 801;
        timeSliderActive = true;
        layerSwiperActive = true;
        const wrapper = shallowMount(TimeSlider, {
            global: {
                plugins: [store]
            },
            propsData: {layerId: "layerId"}
        });

        expect(wrapper.find(".timeSlider-innerWrapper-interactions").exists()).to.be.true;
        expect(wrapper.find(".timeSlider-innerWrapper-interactions").element.tagName).to.equal("DIV");
        expect(wrapper.find("#timeSlider-button-backward-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-backward-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-button-play-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-play-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-button-forward-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-button-forward-layerId").element.tagName).to.equal("ICON-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-input-range-layerId-label").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-input-range-layerId-label").element.tagName).to.equal("LABEL");
        expect(wrapper.find("#timeSlider-input-range-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-input-range-layerId").element.tagName).to.equal("INPUT");
        expect(wrapper.find(".timeSlider-innerWrapper").exists()).to.be.true;
        expect(wrapper.find(".timeSlider-innerWrapper").element.tagName).to.equal("DIV");
        expect(wrapper.find("#timeSlider-activate-layerSwiper-layerId").exists()).to.be.true;
        expect(wrapper.find("#timeSlider-activate-layerSwiper-layerId").element.tagName).to.equal("FLAT-BUTTON-STUB");
        expect(wrapper.find("#timeSlider-activate-layerSwiper-layerId").attributes("text")).to.equal("common:modules.wmsTime.timeSlider.buttons.deactivateLayerSwiper");
    });
});
