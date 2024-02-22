import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ControlBar from "../../../components/ControlBar.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/controls/components/ControlBar.vue", () => {
    let store,
        components;

    beforeEach(() => {
        components = {
            BackForward: {
                name: "BackForward",
                template: "<span />"
            },
            Button3d: {
                name: "Button3d",
                template: "<span />"
            },
            Zoom: {
                name: "ZoomInAndOut",
                template: "<span />"
            }
        };
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    getters: {
                        activatedExpandable: sinon.stub(),
                        componentMap: () => components
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: sinon.stub()
                    }
                }
            },
            getters: {
                controlsConfig: () => sinon.stub(),
                deviceMode: sinon.stub(),
                uiStyle: sinon.stub(),
                portalConfig: sinon.stub()
            }
        });
    });

    it("renders the buttons group", () => {
        const wrapper = mount(ControlBar, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find(".btn-group-controls").exists()).to.be.true;
    });

    it("renders the button", async () => {
        const wrapper = mount(ControlBar, {
            global: {
                plugins: [store]
            }});

        await wrapper.vm.categorizedControls.expandable.push("control");

        expect(wrapper.find(".control-icon-controls").exists()).to.be.true;
    });

    describe("fillCategorizedControls", () => {
        it("should fill categorizedControls.initialVisible", async () => {
            const wrapper = mount(ControlBar, {
                global: {
                    plugins: [store]
                }});

            await wrapper.vm.fillCategorizedControls("Zoom");

            expect(wrapper.vm.categorizedControls.initialVisible).to.be.an("array").that.is.not.empty;
            expect(wrapper.vm.categorizedControls.expandable).to.be.an("array").that.is.empty;
        });

        it("should fill categorizedControls.expandable", async () => {
            sinon.stub(ControlBar.methods, "checkIsVisible").returns(true);
            const wrapper = mount(ControlBar, {
                global: {
                    plugins: [store]
                }});

            await wrapper.vm.fillCategorizedControls("Zoom", true);

            expect(wrapper.vm.categorizedControls.initialVisible).to.be.an("array").that.is.empty;
            expect(wrapper.vm.categorizedControls.expandable).to.be.an("array").that.is.not.empty;
        });
    });
});
