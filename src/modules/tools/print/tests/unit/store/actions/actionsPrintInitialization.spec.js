import VectorLayer from "ol/layer/Vector.js";

import testAction from "../../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../../store/actions/actionsPrintInitialization";

const {
    togglePostrenderListener
} = actions;

describe("src/modules/tools/print/store/actions/actionsPrintInitialization.js", () => {
    describe("togglePostrenderListener", function () {
        it("toggle the post render listener with active false and should unregister listener", done => {
            const TileLayer = {},
                state = {
                    active: false,
                    visibleLayerList: [
                        TileLayer,
                        VectorLayer,
                        VectorLayer,
                        VectorLayer,
                        VectorLayer
                    ],
                    eventListener: undefined,
                    layoutList: [{
                        name: "A4 Hochformat"
                    }]
                };

            testAction(togglePostrenderListener, undefined, state, {}, [
                {type: "setVisibleLayer", payload: state.visibleLayerList, commit: true},
                {type: "setEventListener", payload: undefined, commit: true}
            ], {}, done);
        });
    });
});
