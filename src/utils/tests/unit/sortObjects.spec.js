import {expect} from "chai";
import {sortObjectsByNestedAttributes} from "../../sortObjects.js";

describe("src/utils/sortObjects.js", () => {
    const objects = [
        {
            name: "1a",
            properties: {
                housenumber: {
                    _: 1
                },
                hausnumberextension: {
                    _: "a"
                }
            }
        },
        {
            name: "1",
            properties: {
                housenumber: {
                    _: 1
                }
            }
        },
        {
            name: "1b",
            properties: {
                housenumber: {
                    _: 1
                },
                hausnumberextension: {
                    _: "b"
                }
            }
        },
        {
            name: "2",
            properties: {
                housenumber: {
                    _: 2
                }
            }
        }
    ];

    describe("sortObjectsByNestedAttributes", () => {
        it("should return an array with sorted objects by nested input strings", () => {
            const nestedAttributes = ["properties.hausnumberextension._", "properties.housenumber._"];

            expect(sortObjectsByNestedAttributes(objects, nestedAttributes)).to.be.an("array");
            expect(sortObjectsByNestedAttributes(objects, nestedAttributes)).to.have.deep.members([
                {
                    name: "1",
                    properties: {
                        housenumber: {
                            _: 1
                        }
                    }
                },
                {
                    name: "1a",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "a"
                        }
                    }
                },
                {
                    name: "1b",
                    properties: {
                        housenumber: {
                            _: 1
                        },
                        hausnumberextension: {
                            _: "b"
                        }
                    }
                },
                {
                    name: "2",
                    properties: {
                        housenumber: {
                            _: 2
                        }
                    }
                }
            ]);
        });
    });
});
