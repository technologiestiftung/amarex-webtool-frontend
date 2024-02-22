import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import ShareViewComponent from "../../../components/ShareView.vue";
import ShareView from "../../../store/indexShareView";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/shareView/components/ShareView.vue", () => {
    const mockConfigJson = {
        portalConfig: {
            navigationSecondary: {
                sections: [
                    {
                        shareView: {
                            title: "Share",
                            icon: "bi-share",
                            itemType: "shareView",
                            facebookShare: true,
                            copyShare: true,
                            qrShare: true
                        }
                    }
                ]
            }
        }
    };
    let defaultState,
        store,
        wrapper;

    before(() => {
        defaultState = {...ShareView.state};
    });

    beforeEach(() => {
        mapCollection.clear();

        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        ShareView: {
                            namespaced: true,
                            getters: {
                                url: () => sinon.stub(),
                                facebookShare: () => sinon.stub(),
                                copyShare: () => sinon.stub(),
                                qrShare: () => sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        getView: sinon.stub()
                    },
                    actions: {}
                }
            },
            state: {
                configJson: mockConfigJson
            },
            getters: {
                visibleLayerConfigs: sinon.stub(),
                isMobile: sinon.stub()
            }
        });

    });

    afterEach(() => {
        sinon.restore();
    });

    after(() => {
        ShareView.state = defaultState;
    });

    it("renders the shareView component", () => {
        wrapper = shallowMount(ShareViewComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#share-view").exists()).to.be.true;
        expect(wrapper.find("#facebook-btn").exists()).to.be.true;
        expect(wrapper.find("#copy-btn").exists()).to.be.true;
        expect(wrapper.find("#qr-btn").exists()).to.be.true;
    });

});
