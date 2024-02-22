import {expect} from "chai";
import {fieldValueChanged, prepareLiterals} from "../../../js/literalFunctions";

describe("src_3_0_0/modules/wfsSearch/js/literalFunctions.js", () => {
    const id = "wfsSearch-clause-0+field-0",
        stateLiterals = [
            {
                "clause": {
                    "type": "and",
                    "literals": [
                        {
                            "field": {
                                "type": "equal",
                                "inputLabel": "Gemarkungsname*",
                                "fieldName": "gemname",
                                "options": "",
                                "required": true,
                                "value": null
                            }
                        },
                        {
                            "field": {
                                "type": "equal",
                                "inputLabel": "Flurnummer",
                                "fieldName": "flur",
                                "options": "flur",
                                "value": null
                            }
                        },
                        {
                            "field": {
                                "type": "equal",
                                "inputLabel": "Zähler*",
                                "fieldName": "zaehler",
                                "options": "flur.zaehler",
                                "required": true,
                                "value": null
                            }
                        },
                        {
                            "field": {
                                "type": "equal",
                                "inputLabel": "Nenner",
                                "fieldName": "nenner",
                                "options": "flur.zaehler.nenner",
                                "value": null
                            }
                        }
                    ]
                }
            }
        ],
        requiredValues = {
            [id]: null,
            "wfsSearch-clause-0+field-2": null
        };

    describe("prepareLiterals", () => {
        it("should add unique ids to the clauses and fields", () => {
            expect(prepareLiterals(stateLiterals)).to.eql(requiredValues);
        });
    });

    describe("fieldValueChanged", () => {
        it("should update the required Values and return them", () => {
            const value = "Waldesch";

            expect(fieldValueChanged(id, value, stateLiterals, requiredValues, 0)).to.eql({
                [id]: value,
                "wfsSearch-clause-0+field-2": null
            });
        });
    });
});
