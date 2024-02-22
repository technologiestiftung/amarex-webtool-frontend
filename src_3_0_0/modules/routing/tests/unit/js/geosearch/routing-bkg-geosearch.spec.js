import axios from "axios";
import store from "../../../../../../app-store";
import state from "./../../../../store/stateRouting";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../js/classes/routing-geosearch-result";
import {
    checkConfiguredBbox,
    fetchRoutingBkgGeosearch,
    getRoutingBkgGeosearchUrl,
    getRoutingBkgGeosearchReverseUrl,
    fetchRoutingBkgGeosearchReverse
} from "../../../../js/geosearch/routing-bkg-geosearch";

describe("src_3_0_0/modules/routing/js/geosearch/routing-bkg-geosearch.js", () => {
    let service;

    beforeEach(() => {
        service = "https://service";
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            restServiceById: sinon.stub().callsFake(() =>{
                return {url: service};
            })
        };
        store.state.Modules.Routing.geosearchReverse = {
            serviceId: {
                url: "http://serviceId.url"
            },
            distance: "1000"
        };
        store.state.Modules.Routing.geosearch = {
            serviceId: {
                url: "http://serviceId.url"
            },
            limit: 1000,
            bbox: {"CAR": "10,20,30,40"}
        };
        store.state.Modules.Routing.directionsSettings = {
            speedProfile: "CAR"
        };
        global.window = {
            location: {
                origin: "https://origin"
            }
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingBkgGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise(resolve => resolve({
                    status: 200,
                    data: {
                        success: true,
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                bbox: [
                                    6.47933210954439,
                                    51.2849325585585,
                                    6.70186498354972,
                                    51.4071125869666
                                ],
                                geometry: {
                                    type: "Point",
                                    coordinates: [6.56089, 51.33264]
                                },
                                properties: {
                                    text: "Krefeld",
                                    typ: "Ort",
                                    score: 1.7286196,
                                    bbox: {
                                        type: "Polygon",
                                        coordinates: [
                                            [
                                                [6.47933, 51.28493],
                                                [6.47933, 51.40711],
                                                [6.70186, 51.40711],
                                                [6.70186, 51.28493],
                                                [6.47933, 51.28493]
                                            ]
                                        ]
                                    }
                                },
                                id: "DEGAC00000081638"
                            },
                            {
                                type: "Feature",
                                bbox: [
                                    6.5074903650681,
                                    51.3455092448856,
                                    6.51893373216666,
                                    51.3473656574494
                                ],
                                geometry: {
                                    type: "Point",
                                    coordinates: [6.51518, 51.34567]
                                },
                                properties: {
                                    text: "47804 Krefeld - Hüls",
                                    typ: "Ort",
                                    score: 1.7022437,
                                    bbox: {
                                        type: "Polygon",
                                        coordinates: [
                                            [
                                                [6.50749, 51.34551],
                                                [6.50749, 51.34737],
                                                [6.51893, 51.34737],
                                                [6.51893, 51.34551],
                                                [6.50749, 51.34551]
                                            ]
                                        ]
                                    }
                                },
                                id: "DEGAC00000027025"
                            }
                        ]
                    }
                }))
            );

            const result = await fetchRoutingBkgGeosearch("testsearch"),
                expectedResult = [
                    new RoutingGeosearchResult([6.56089, 51.33264], "Krefeld"),
                    new RoutingGeosearchResult([6.51518, 51.34567], "47804 Krefeld - Hüls")
                ];

            expect(result).deep.to.equal(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                })
                )
            );

            try {
                await fetchRoutingBkgGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });

    describe("should fetchRoutingBkgGeosearchReverse", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise(resolve => resolve({
                    status: 200,
                    data: {
                        success: true,
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                bbox: [
                                    6.56412165145409,
                                    51.3267394906946,
                                    6.56944658394794,
                                    51.3400332636572
                                ],
                                geometry: {
                                    type: "Point",
                                    coordinates: [6.56619, 51.33329]
                                },
                                properties: {
                                    text: "47798 Krefeld - Cracau",
                                    typ: "Ort",
                                    score: 1.542608,
                                    bbox: {
                                        type: "Polygon",
                                        coordinates: [
                                            [
                                                [6.56412, 51.32674],
                                                [6.56412, 51.34003],
                                                [6.56945, 51.34003],
                                                [6.56945, 51.32674],
                                                [6.56412, 51.32674]
                                            ]
                                        ]
                                    }
                                },
                                id: "DEGAC00000026993"
                            }
                        ]
                    }
                }))
            );

            const result = await fetchRoutingBkgGeosearchReverse("testsearch"),
                expectedResult = new RoutingGeosearchResult([6.56619, 51.33329], "47798 Krefeld - Cracau");

            expect(result).deep.to.eql(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                }))
            );

            try {
                await fetchRoutingBkgGeosearchReverse("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
    describe("should checkConfiguredBbox", () => {
        it("should process result as false with no configuration", () => {
            store.state.Modules.Routing.directionsSettings = {};
            const result = checkConfiguredBbox();

            expect(result).to.be.false;
        });
        it("should process result correctly with given bbox", () => {
            state.geosearch = {bbox: {"CAR": "10,20,30,40"}};
            const result = checkConfiguredBbox();

            expect(result).to.eql("10,20,30,40");
        });
    });
    describe("getRoutingBkgGeosearchReverseUrl", () => {
        it("test params", () => {
            const coordinates = ["1", "2"],
                createdUrl = getRoutingBkgGeosearchReverseUrl(coordinates);

            expect(createdUrl.origin).to.eql(service);
            expect(createdUrl.searchParams.get("lon")).to.eql(coordinates[0]);
            expect(createdUrl.searchParams.get("lat")).to.eql(coordinates[1]);
            expect(createdUrl.searchParams.get("count")).to.be.equals("1");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("distance")).to.eql("1000");
        });
        it("createUrl should respect questionmark in serviceUrl", () => {
            const coordinates = ["1", "2"];
            let createdUrl = null;

            service = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map";
            createdUrl = getRoutingBkgGeosearchReverseUrl(coordinates);
            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(decodeURI(createdUrl)).to.eql(service + "&lon=1&lat=2&count=1&properties=text&distance=1000&filter=typ%3Aort");
            expect(createdUrl.searchParams.get("lon")).to.eql(coordinates[0]);
            expect(createdUrl.searchParams.get("lat")).to.eql(coordinates[1]);
            expect(createdUrl.searchParams.get("count")).to.be.equals("1");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("distance")).to.eql("1000");
        });
    });

    describe("getRoutingBkgGeosearchUrl", () => {
        it("test params", async () => {
            const search = "search",
                createdUrl = await getRoutingBkgGeosearchUrl(search);

            expect(createdUrl.origin).to.eql(service);
            expect(createdUrl.searchParams.get("count")).to.be.equals("1000");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("query")).to.eql("search");
            expect(createdUrl.searchParams.get("bbox")).to.eql("10,20,30,40");
        });
        it("service url with backslash at start", async () => {
            service = "/tmp/";
            const search = "search",
                createdUrl = await getRoutingBkgGeosearchUrl(search);

            expect(createdUrl.origin).to.eql(global.window.location.origin);
            expect(createdUrl.href).to.eql(global.window.location.origin + service + "?count=1000&properties=text&query=search&bbox=10%2C20%2C30%2C40");

        });
        it("createUrl should respect questionmark in serviceUrl", async () => {
            const search = "search";
            let createdUrl = null;

            service = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map";
            createdUrl = await getRoutingBkgGeosearchUrl(search);
            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(decodeURI(createdUrl)).to.eql(service + "&count=1000&properties=text&query=search&bbox=10%2C20%2C30%2C40");
            expect(createdUrl.searchParams.get("count")).to.be.equals("1000");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("query")).to.eql("search");
            expect(createdUrl.searchParams.get("bbox")).to.eql("10,20,30,40");
        });
    });
});
