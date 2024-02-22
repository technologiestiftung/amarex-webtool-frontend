import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";

import WfsSearchField from "../../../components/WfsSearchField.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/wfsSearch/components/WfsSearchField.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        WfsSearch: WfsSearchModule
                    }
                }
            }
        });
    });

    it("renders an input element with fitting label", () => {
        const wrapper = mount(WfsSearchField, {
            global: {
                plugins: [store]
            },
            props: {
                fieldId: "fieldId",
                fieldName: "fieldName",
                inputLabel: "inputLabel"
            }
        });

        expect(wrapper.find("input").exists()).to.be.true;
        expect(wrapper.find("select").exists()).to.be.false;
        expect(wrapper.find("label").text()).to.equal("inputLabel");
    });

    it("renders a select element for the value when given options", () => {
        const wrapper = mount(WfsSearchField, {
                global: {
                    plugins: [store]
                },
                props: {
                    fieldId: "fieldId",
                    fieldName: "fieldName",
                    inputLabel: "inputLabel",
                    options: ["Option A", "Option B"]
                }
            }),
            options = wrapper.findAll("option");

        expect(wrapper.find("select").exists()).to.be.true;
        expect(wrapper.find("label").text()).to.equal("inputLabel");
        expect(wrapper.find("input").exists()).to.be.false;
        expect(options.at(0).text()).to.equal("common:modules.wfsSearch.optionsPlaceholder");
        expect(options.at(1).text()).to.equal("Option A");
        expect(options.at(2).text()).to.equal("Option B");
    });

    it("renders a label with string that contains '*'", () => {
        const wrapper = mount(WfsSearchField, {
            global: {
                plugins: [store]
            },
            props: {
                fieldId: "fieldId",
                fieldName: "fieldName",
                inputLabel: "common:modules.wfsSearch.parcelNumber*"
            }
        });

        expect(wrapper.find("label").exists()).to.be.true;
        expect(wrapper.find("label").text()).to.equals("common:modules.wfsSearch.parcelNumber*");
    });
});
