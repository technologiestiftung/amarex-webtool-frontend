import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ContactComponent from "../../../components/ContactFormular.vue";
import ContactModule from "../../../store/indexContact";

config.global.mocks.$t = key => key;

/**
 * Fills all form fields with joke data for testing..
 * @param {Object} parameters holds the text inputs
 * @returns {void}
 */
function fillFields ({nameInput, mailInput, phoneInput, messageInput}) {
    nameInput.element.value = "Chuck Testa";
    nameInput.trigger("keyup");
    mailInput.element.value = "testa@example.com";
    mailInput.trigger("keyup");
    phoneInput.element.value = "555";
    phoneInput.trigger("keyup");
    messageInput.element.value = "Thought this was a deer?";
    messageInput.trigger("keyup");
}

describe("src_3_0_0/modules/contact/components/ContactFormular.vue", () => {
    let store, wrapper;

    beforeEach(() => {
        ContactModule.actions.send = sinon.spy();
        ContactModule.actions.onSendSuccess = sinon.spy();

        ContactModule.state.serviceId = undefined;

        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Contact: ContactModule
                    }
                }
            },
            getters: {
                uiStyle: () => sinon.stub()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("has a disabled save button if the form is not completed", () => {
        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});


        const sendButton = wrapper.find("#module-contact-send-message");

        expect(sendButton.exists()).to.be.true;
        expect(sendButton.attributes("disabled")).to.equal("");
    });

    it("has an enabled & working save button if the form is completed", async () => {
        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message"),
            nameInput = wrapper.find("#module-contact-username-input"),
            mailInput = wrapper.find("#module-contact-mail-input"),
            phoneInput = wrapper.find("#module-contact-phone-input"),
            messageInput = wrapper.find("#module-contact-message-input");

        fillFields({nameInput, mailInput, phoneInput, messageInput});
        await wrapper.vm.$nextTick();

        expect(sendButton.exists()).to.be.true;
        expect(sendButton.attributes().disabled).to.be.undefined;

        sendButton.trigger("submit");
        expect(ContactModule.actions.send.calledOnce).to.be.true;
    });

    it("keeps the send button disabled if any field is missing", async () => {

        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message"),
            nameInput = wrapper.find("#module-contact-username-input"),
            mailInput = wrapper.find("#module-contact-mail-input"),
            phoneInput = wrapper.find("#module-contact-phone-input"),
            messageInput = wrapper.find("#module-contact-message-input");

        for (const emptyInput of [nameInput, mailInput, phoneInput, messageInput]) {
            fillFields({nameInput, mailInput, phoneInput, messageInput});

            emptyInput.element.value = "";
            emptyInput.trigger("keyup");

            await wrapper.vm.$nextTick();

            expect(sendButton.exists()).to.be.true;
            expect(sendButton.attributes().disabled).to.equal("");
        }
    });

    it("optionally renders an additional info field and privacy policy checkbox; must tick checkbox to send form", async () => {
        ContactModule.state.contactInfo = "If you live nearby, why not shout the message out from your window at 3AM?";
        ContactModule.state.showPrivacyPolicy = true;

        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message"),
            nameInput = wrapper.find("#module-contact-username-input"),
            mailInput = wrapper.find("#module-contact-mail-input"),
            phoneInput = wrapper.find("#module-contact-phone-input"),
            messageInput = wrapper.find("#module-contact-message-input"),
            checkbox = wrapper.find("#module-contact-privacyPolicy-input");

        expect(wrapper.find("#module-contact-addionalInformation").exists()).to.be.true;
        expect(checkbox.exists()).to.be.true;

        fillFields({nameInput, mailInput, phoneInput, messageInput});
        await wrapper.vm.$nextTick();

        expect(sendButton.attributes().disabled).to.equal("");

        checkbox.trigger("click");
        await wrapper.vm.$nextTick();

        expect(sendButton.attributes().disabled).to.be.undefined;
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = mount(ContactComponent, {
            attachTo: elem,
            global: {
                plugins: [store]
            }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#module-contact-username-input").element).to.equal(document.activeElement);
    });
});
