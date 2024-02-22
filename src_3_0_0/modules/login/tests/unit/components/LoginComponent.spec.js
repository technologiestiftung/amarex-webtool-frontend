import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";

import LoginComponent from "../../../components/LoginComponent.vue";
import Login from "../../../store/indexLogin.js";
import rootGetters from "../../../../../app-store/getters.js";
import Cookie from "../../../js/utilsCookies.js";
import OIDC from "../../../js/utilsOIDC.js";

import {expect} from "chai";
import sinon from "sinon";


const fakeToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjViY2IzZThmNDM2MGI0YjI4MWRjNDM4ZTExODE4YzZlIn0.e30.LEo9imrM5zuR1yo-KMzdY62XbnL7UBO2AImB2Pf-bD35NVZlMsU7xsXMUX6petNWU61tJSFzyMk4nWZQHm3LBQ";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/Modules/Login/components/LoginComponent.vue", () => {
    const
        sandbox = sinon.createSandbox();
    let store,
        wrapper;

    beforeEach(() => {
        store = createStore({
            namespaces: true,
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Login: Login
                    }
                },
                Menu: {
                    namespaced: true,
                    mutations: {
                        setCurrentComponentPropsName: sinon.stub(),
                        setCurrentComponentPropsDescription: sinon.stub()
                    }
                }
            },
            getters: {
                mobile: () => false,
                ...rootGetters
            },
            state: { }
        });
        store.commit("Modules/Login/setActive", true);
    });
    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    describe("LoginComponent template", () => {
        it("should render Login", () => {
            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#login-component").exists()).to.be.true;
            expect(wrapper.find("#login-component button#logout-button").exists()).to.be.true;
        });

        it("should have values from store Login renders", () => {
            store.commit("Modules/Login/setScreenName", "Max Mustermann");
            store.commit("Modules/Login/setEmail", "Max.Mustermann@domain.com");

            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.html().includes("Max Mustermann")).to.be.true;
            expect(wrapper.html().includes("Max.Mustermann@domain.com")).to.be.true;
        });

        it("should not call logout fn if button was not clicked", () => {
            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });
            wrapper.vm.logoutButton = sinon.fake();

            expect(wrapper.vm.logoutButton.calledOnce).to.be.false;
        });

        it("should call logout fn if button is clicked", async () => {
            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.reloadWindow = sinon.fake();
            sandbox.spy(wrapper.vm, "logoutButton");
            sandbox.spy(wrapper.vm, "closeLoginWindow");

            await wrapper.find("#login-component button#logout-button").trigger("click");
            expect(wrapper.vm.logoutButton.calledOnce).to.be.true;
            expect(wrapper.vm.closeLoginWindow.calledOnce).to.be.true;
            expect(wrapper.vm.reloadWindow.calledOnce).to.be.true;
        });

        it("should not be logged in after Login renders", () => {
            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.loggedIn).to.be.false;
        });

        it("should be logged in after Login renders", () => {
            const local_sandbox = sinon.createSandbox();

            local_sandbox.replace(Cookie, "get", sinon.fake.returns(fakeToken));
            local_sandbox.stub(OIDC, "getTokenExpiry").returns(1);

            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.loggedIn).to.be.true;

            local_sandbox.restore();
        }).timeout(5000);

        it("should have values from cookies after Login renders", async () => {
            const local_sandbox = sinon.createSandbox();

            local_sandbox.stub(OIDC, "getTokenExpiry").returns(1);
            local_sandbox.replace(Cookie, "get", sinon.fake.returns(fakeToken));

            wrapper = await shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.vm.$store.state.Modules.Login.screenName).to.be.equal(fakeToken);
            expect(wrapper.vm.$store.state.Modules.Login.username).to.be.equal(fakeToken);
            expect(wrapper.vm.$store.state.Modules.Login.email).to.be.equal(fakeToken);

            local_sandbox.restore();
        }).timeout(5000);

    });

    describe("LoginComponent methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(LoginComponent, {
                global: {
                    plugins: [store]
                }
            });
            wrapper.vm.closeLoginWindow();
            await wrapper.vm.$nextTick();

            expect(store.state.Modules.Login.active).to.be.false;
        });
    });

});
