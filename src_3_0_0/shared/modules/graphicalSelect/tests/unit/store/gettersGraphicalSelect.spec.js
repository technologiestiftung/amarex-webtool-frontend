import {expect} from "chai";
import stateGraphicalSelect from "../../../store/stateGraphicalSelect";


describe("src_3_0_0/share-components/graphicalSelect/store/gettersGraphicalSelect", function () {
    it("returns the active from state", function () {
        expect(stateGraphicalSelect.active).to.be.false;
    });
    it("returns the name from state", function () {
        expect(stateGraphicalSelect.name).to.be.equal("Geometrie");
    });

    it("returns the displayName default value from state", function () {
        expect(stateGraphicalSelect.displayName).to.be.equal("common:shared.modules.graphicalSelect.displayName");
    });
    it("returns the snippetType default value from state", function () {
        expect(stateGraphicalSelect.snippetType).to.be.equal("graphicalSelect");
    });
    it("returns the selectionElements default value from state", function () {
        expect(stateGraphicalSelect.selectionElements).to.be.eql(["Dropdown"]);
    });
    it("returns the geographicValues default value from state", function () {
        expect(stateGraphicalSelect.geographicValues).to.be.eql(["Box", "Circle", "Polygon"]);
    });
    it("returns the currentValue default value from state", function () {
        expect(stateGraphicalSelect.currentValue).to.be.equal("");
    });
    it("returns the tooltipMessage default value from state", function () {
        expect(stateGraphicalSelect.tooltipMessage).to.be.equal("common:shared.modules.graphicalSelect.tooltipMessage");
    });
    it("returns the tooltipMessagePolygon default value from state", function () {
        expect(stateGraphicalSelect.tooltipMessagePolygon).to.be.equal("common:shared.modules.graphicalSelect.tooltipMessagePolygon");
    });
    it("returns the selectedAreaGeoJson default value from state", function () {
        expect(stateGraphicalSelect.selectedAreaGeoJson).to.be.equal(undefined);
    });
    it("returns the defaultSelection default value from state", function () {
        expect(stateGraphicalSelect.defaultSelection).to.be.equal("");
    });
});
