/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";
import ScaleSwitcher from "../../../store/indexScaleSwitcher";
import View from "ol/View";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/scaleSwitcher/components/ScaleSwitcher.vue", () => {
    it("method close sets active to false", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        wrapper.vm.close();
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.ScaleSwitcher.active).to.be.false;
        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });
});
