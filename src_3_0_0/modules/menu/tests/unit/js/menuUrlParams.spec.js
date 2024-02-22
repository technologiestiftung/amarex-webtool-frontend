import menuUrlParams from "../../../js/menuUrlParams";
import store from "../../../../../app-store";
import {expect} from "chai";

describe("src_3_0_0/modules/menu/js/menuUrlParams.js", () => {
    const dispatchCalls = {};

    beforeEach(() => {
        store.dispatch = (arg1, arg2) => {
            dispatchCalls[arg1] = arg2 !== undefined ? arg2 : "called";
        };
    });

    describe("setAttributesToComponent", () =>{
        beforeEach(() => {
            store.getters = {
                "Menu/mainMenu": {
                    sections: []
                },
                "Menu/secondaryMenu": {
                    sections: [[
                        {
                            type: "measure"
                        }
                    ]]
                }
            };
        });

        it("set the attributes to the component through menu", () => {
            const params = {
                MENU: "{\"main\":{\"currentComponent\":\"root\"},\"secondary\":{\"currentComponent\":\"measure\",\"attributes\":{\"selectedGeometry\":\"Polygon\",\"selectedUnit\":\"1\"}}}"
            };
            let activateCurrentComponent = null,
                updateComponentState = null;

            menuUrlParams.setAttributesToComponent(params);
            activateCurrentComponent = dispatchCalls["Menu/activateCurrentComponent"];
            updateComponentState = dispatchCalls["Menu/updateComponentState"];

            expect(activateCurrentComponent).to.deep.equals({
                currentComponent: {
                    type: "measure"
                },
                type: "Measure",
                side: "secondaryMenu"
            });
            expect(updateComponentState).to.deep.equals({
                type: "Measure",
                attributes: {
                    selectedGeometry: "Polygon",
                    selectedUnit: "1"
                }
            });

        });
    });

    describe("isInitOpen", () =>{
        beforeEach(() => {
            store.getters = {
                "Menu/mainMenu": {
                    sections: [[
                        {
                            type: "fileImport"
                        }
                    ]]
                },
                "Menu/secondaryMenu": {
                    sections: []
                }
            };
        });

        it("activate current component with ISINITOPEN", () => {
            const params = {ISINITOPEN: "fileimport"};
            let activateCurrentComponent = null;

            menuUrlParams.isInitOpen(params);
            activateCurrentComponent = dispatchCalls["Menu/activateCurrentComponent"];

            expect(activateCurrentComponent).to.deep.equals({
                currentComponent: {
                    type: "fileImport"
                },
                type: "FileImport",
                side: "mainMenu"
            });
        });

        it("activate current component with STARTUPMODUL", () => {
            const params = {STARTUPMODUL: "fileimport"};
            let activateCurrentComponent = null;

            menuUrlParams.isInitOpen(params);
            activateCurrentComponent = dispatchCalls["Menu/activateCurrentComponent"];

            expect(activateCurrentComponent).to.deep.equals({
                currentComponent: {
                    type: "fileImport"
                },
                type: "FileImport",
                side: "mainMenu"
            });
        });
    });

    describe("getCurrentComponent", () =>{
        beforeEach(() => {
            store.getters = {
                "Menu/mainMenu": {
                    sections: [[
                        {
                            type: "fileImport"
                        }
                    ]]
                },
                "Menu/secondaryMenu": {
                    sections: []
                }
            };
        });

        it("returns the current component and side", () => {
            const searchType = "fileimport";

            expect(menuUrlParams.getCurrentComponent(searchType)).to.deep.equals({
                currentComponent: {
                    type: "fileImport"
                },
                side: "mainMenu"
            });
        });
    });

    describe("findInSections", () =>{
        it("return current compoment in section", () => {
            const sections = [[
                    {
                        type: "fileImport"
                    }
                ]],
                searchType = "fileimport";

            expect(menuUrlParams.findInSections(sections, searchType)).to.deep.equals({
                type: "fileImport"
            });
        });
    });

    describe("findElement", () =>{
        it("return element from elements", () => {
            const sections = [
                    {
                        type: "fileImport"
                    }
                ],
                searchType = "fileimport";

            expect(menuUrlParams.findElement(sections, searchType)).to.deep.equals({
                type: "fileImport"
            });
        });

        it("return element from folder elements", () => {
            const sections = [
                    {
                        type: "folder",
                        elements: [
                            {
                                type: "fileImport"
                            }
                        ]
                    }
                ],
                searchType = "fileimport";

            expect(menuUrlParams.findElement(sections, searchType)).to.deep.equals({
                type: "fileImport"
            });
        });
    });
});
