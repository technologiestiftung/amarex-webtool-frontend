import load3DScript from "@masterportal/masterportalapi/src/lib/load3DScript";
import {expect} from "chai";
import sinon from "sinon";

import {initializeMaps, load3DMap} from "../../../js/maps";
import store from "../../../../../app-store";

describe("src_3_0_0/core/js/maps/maps.js", () => {
    let load3DScriptSpy;

    before(() => {
        mapCollection.clear();

        load3DScriptSpy = sinon.spy(load3DScript, "load3DScript");
    });

    beforeEach(() => {
        store.getters = {
            cesiumLibrary: "path_to_cesium_library"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("initializeMaps", () => {
        it("2D map should exists after createMaps", () => {
            const portalConfig = {
                    portal: "config"
                },
                configJs = {
                    config: "js"
                };

            initializeMaps(portalConfig, configJs);

            expect(mapCollection.getMap("2D")).to.be.not.undefined;
            expect(load3DScriptSpy.calledOnce).to.be.true;
        });
    });

    describe("load3DMap", () => {
        it("should trigger the masterportalapi function load3DScript", () => {
            const configJs = {
                config: "js"
            };

            load3DMap(configJs);

            expect(load3DScriptSpy.calledOnce).to.be.true;
            expect(load3DScriptSpy.firstCall.args[0]).to.equals("path_to_cesium_library");
            expect(typeof load3DScriptSpy.firstCall.args[1]).to.equals("function");
        });
    });
});
