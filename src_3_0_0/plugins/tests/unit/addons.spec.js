import {expect} from "chai";
import sinon from "sinon";
import addons from "../../../plugins/addons";
import main from "../../../main";


describe("src_3_0_0/plugins/addons.js", () => {
    const globalProperties = {
        config: {
            globalProperties: {}
        }
    };

    beforeEach(() => {
        sinon.stub(main, "getApp").returns(globalProperties);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("loadAddons", () => {
        it("if config is undefined nothing happens", async () => {
            const loadControls = sinon.spy(addons, "loadControls"),
                spyloadGfiThemes = sinon.spy(addons, "loadGfiThemes"),
                spyloadSearchInterfaces = sinon.spy(addons, "loadSearchInterfaces"),
                spyloadToolAddons = sinon.spy(addons, "loadToolAddons");

            await addons.loadAddons([undefined]);
            expect(await loadControls.notCalled).to.be.true;
            expect(await spyloadGfiThemes.notCalled).to.be.true;
            expect(await spyloadSearchInterfaces.notCalled).to.be.true;
            expect(await spyloadToolAddons.notCalled).to.be.true;
        });
    });
});
