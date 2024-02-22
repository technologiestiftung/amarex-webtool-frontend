import {expect} from "chai";
import mutations from "../../../controls-store/mutationsControls";

const {registerControl} = mutations;

describe("src_3_0_0/modules/controls/controls-store/mutationsControls.js", () => {
    describe("registerControl", () => {
        it("add hiddenMobile control to componentMap", () => {
            const state = {
                    mobileHiddenControls: [
                        "BackForward",
                        "FullScreen"
                    ],
                    expandableControls:
                [
                    "BackForward"
                ]
                },
                name = "name";

            registerControl(state, {name, control: null, hiddenMobile: true, expandableControls: true});

            expect(state.mobileHiddenControls.length).to.equals(3);
            expect(state.mobileHiddenControls).to.deep.equals(["BackForward",
                "FullScreen", "name"]);
            expect(state.expandableControls.length).to.equals(2);
            expect(state.expandableControls).to.deep.equals(["BackForward",
                "name"]);
        });
    });
});
