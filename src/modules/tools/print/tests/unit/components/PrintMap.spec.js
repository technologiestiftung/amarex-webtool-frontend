import Vuex from "vuex";
import {config, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/Print/components/PrintMap.vue", () => {
    let wrapper;

    describe("template", () => {
        it("should emitted close event if button is clicked", async () => {
            const button = wrapper.find(".bi-x-lg");

            expect(button).to.exist;

            button.trigger("click");
            expect(wrapper.emitted()).to.have.property("close");
            expect(wrapper.emitted().close).to.have.lengthOf(1);
        });
    });

    describe("gfi-option", () => {
        it("should deselect GFI when currentFeature changes", async () => {
            store.commit("Tools/Print/setIsGfiAvailable", true);
            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.find("#printGfi").exists()).to.be.true;
            expect(wrapper.find("#printGfi").disabled).to.be.undefined;

            wrapper.find("#printGfi").setChecked();
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#printGfi").exists()).to.be.true;
            expect(wrapper.find("#printGfi").disabled).to.be.undefined;
            expect(wrapper.find("#printGfi").element.checked).to.be.true;

            store.commit("Tools/Print/setIsGfiSelected", false);
            await wrapper.vm.$nextTick();

            expect(wrapper.find("#printGfi").exists()).to.be.true;
            expect(wrapper.find("#printGfi").element.checked).to.be.false;
        });
    });

    describe("hasLayoutAttribute", () => {
        it("should return true if the layout has the attribute", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            const hasAttr = wrapper.vm.hasLayoutAttribute(wrapper.vm.currentLayout, "title");

            expect(hasAttr).to.be.true;
        });
        it("should return false if the layout has not the attribute", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            const hasAttr = wrapper.vm.hasLayoutAttribute(wrapper.vm.currentLayout, "random");

            expect(hasAttr).to.be.false;
        });

        it("should return false if the given layout is not an object", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.vm.hasLayoutAttribute("", "random")).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute([], "random")).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute(true, "random")).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute(undefined, "random")).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute(null, "random")).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute(666, "random")).to.be.false;
        });

        it("should return false if the given attribute name is not a string", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.vm.hasLayoutAttribute({}, {})).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute({}, [])).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute({}, 666)).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute({}, undefined)).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute({}, null)).to.be.false;
            expect(wrapper.vm.hasLayoutAttribute({}, true)).to.be.false;
        });
    });

    describe("getLayoutAttributes", () => {
        it("should return an object the correct attribute", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            const attributes = wrapper.vm.getLayoutAttributes(wrapper.vm.currentLayout, ["title"]);

            expect(attributes).to.be.an("object");
            expect(attributes).to.have.property("title");
        });
        it("should return an empty object if the attribute is not present", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            const attributes = wrapper.vm.getLayoutAttributes(wrapper.vm.currentLayout, ["random"]);

            expect(attributes).to.be.empty;
        });

        it("should return an empty object if the given layout is not an object", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.vm.getLayoutAttributes("", "random")).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes([], "random")).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes(true, "random")).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes(undefined, "random")).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes(null, "random")).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes(666, "random")).to.be.empty;
        });

        it("should return an empty object if the second given parameter is not an array", () => {
            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.vm.getLayoutAttributes({}, {})).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes({}, "666")).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes({}, 666)).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes({}, undefined)).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes({}, null)).to.be.empty;
            expect(wrapper.vm.getLayoutAttributes({}, true)).to.be.empty;
        });
    });
});
