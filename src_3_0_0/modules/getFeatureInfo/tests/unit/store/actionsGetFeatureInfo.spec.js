import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsGetFeatureInfo.js";


describe("src_3_0_0/modules/getFeatureInfo/store/actionsGetFeatureInfo.js", () => {
    let getters,
        dispatch;

    before(() => {
        mapCollection.clear();
        const map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return {
                    primitives: {
                        show: true,
                        contains: () => true,
                        add: sinon.stub()
                    }
                };
            }
        };

        mapCollection.addMap(map3D, "3D");
        global.Cesium = {};
        global.Cesium.ScreenSpaceEventHandler = function () {
            return {
                setInputAction: () => sinon.stub(),
                destroy: () => sinon.stub()
            };
        };
        global.Cesium.ScreenSpaceEventType = {
            LEFT_CLICK: sinon.stub()
        };
        global.Cesium.Color = {
            RED: () => sinon.stub()
        };
        sinon.stub(console, "warn");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("test 3D Highlighting", () => {
        it("console warns if color is not array or string", () => {
            dispatch = sinon.spy();
            getters = {
                "coloredHighlighting3D": {
                    "color": {}
                }
            };
            actions.highlight3DTile({getters, dispatch});
            expect(console.warn.called).to.be.true;
            expect(console.warn.calledWith("The color for the 3D highlighting is not valid. Please check the config or documentation.")).to.be.true;
        });
        it("dispatch removeHighlightColor", () => {
            dispatch = sinon.spy();
            actions.removeHighlight3DTile({dispatch});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("removeHighlightColor");
        });
    });
});
