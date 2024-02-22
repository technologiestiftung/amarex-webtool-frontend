import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import {expect} from "chai";
import axios from "axios";
import sinon from "sinon";

describe("src_3_0_0/modules/searchBar/searchInterfaces/searchInterface.js", () => {
    let SearchInterface1 = null;

    before(() => {
        SearchInterface1 = new SearchInterface();
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("createPossibleActions", () => {
        it("should throw an error if function 'createPossibleActions' is uses in SearchInterface", () => {
            expect(SearchInterface1.search).to.throw();
        });
    });

    describe("createPossibleActions", () => {
        it("should throw an error if function 'createPossibleActions' is uses in SearchInterface", () => {
            expect(SearchInterface1.search).to.throw();
        });
    });

    describe("normalizeResults", () => {
        it("should throw an error if function 'normalizeResults' is uses in SearchInterface", () => {
            expect(SearchInterface1.search).to.throw();
        });
    });

    describe("search", () => {
        it("should throw an error if function 'search' is uses in SearchInterface", () => {
            expect(SearchInterface1.search).to.throw();
        });
    });

    describe("abortRequest", () => {
        it("should abort the AbortController and set currentController to null", () => {
            SearchInterface1.currentController = new AbortController();
            SearchInterface1.abortRequest();

            expect(SearchInterface1.currentController).to.be.null;
        });
    });

    describe("clearSearchResults", () => {
        it("should clear the searchResults array", () => {
            SearchInterface1.searchResults.push("abc");
            SearchInterface1.clearSearchResults();

            expect(SearchInterface1.searchResults).is.an("array").that.is.empty;
        });
    });

    describe("pushHitsToSearchResults", () => {
        beforeEach(() => {
            SearchInterface1.searchResults = [];
        });

        it("should push two to searchResults", () => {
            SearchInterface1.pushHitsToSearchResults([{id: "abc"}, {id: "def"}]);

            expect(SearchInterface1.totalHits).equals(2);
            expect(SearchInterface1.searchResults.length).equals(2);
            expect(SearchInterface1.searchResults[0].id).equals("abc");
            expect(SearchInterface1.searchResults[1].id).equals("def");
        });
    });

    describe("pushHitToSearchResults", () => {
        beforeEach(() => {
            SearchInterface1.searchResults = [];
        });

        it("should push one hit with id '123' to searchResults", () => {
            SearchInterface1.pushHitToSearchResults({id: "123"});

            expect(SearchInterface1.searchResults.length).equals(1);
            expect(SearchInterface1.searchResults[0].id).equals("123");
        });
    });

    describe("requestSearch", () => {
        it("should send a get request", async () => {
            SearchInterface1.currentController = {
                signal: sinon.stub()
            };

            const urlMock = "/testUrl",
                type = "GET",
                responseMock = {
                    data: {
                        hits: ["hit1", "hit2"]
                    },
                    status: 200
                },
                axiosStub = sinon.stub(axios, "get").resolves(responseMock),
                resultData = await SearchInterface1.requestSearch(urlMock, type);

            expect(resultData.hits).to.deep.equals(["hit1", "hit2"]);
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equals(urlMock);
            expect(axiosStub.firstCall.args[1]).to.have.nested.include({
                "headers.Content-Type": "application/json;charset=UTF-8"
            });
        });
    });

    describe("sendGetRequest", () => {
        it("should return result with hits, if response status is 200", async () => {
            SearchInterface1.currentController = {
                signal: sinon.stub()
            };

            const returnRes = {
                    data: {
                        hits: ["hit", "hit"]
                    },
                    status: 200
                },
                url = "https://geodienste.hamburg.de/",
                axiosStub = sinon.stub(axios, "get").resolves(returnRes),
                response = await SearchInterface1.sendGetRequest(url);

            expect(response).to.deep.equals({
                data: {
                    hits: ["hit", "hit"]
                },
                status: 200
            });
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equals(url);
            expect(axiosStub.firstCall.args[1]).to.have.nested.include({
                "headers.Content-Type": "application/json;charset=UTF-8"
            });
        });
    });

    describe("sendPostRequest", () => {
        it("should return result with hits, if response status is 200", async () => {
            SearchInterface1.currentController = {
                signal: sinon.stub()
            };

            const returnRes = {
                    data: {
                        hits: ["hit", "hit"]
                    },
                    status: 200
                },
                url = "https://geodienste.hamburg.de/",
                axiosStub = sinon.stub(axios, "post").resolves(returnRes),
                response = await SearchInterface1.sendPostRequest(url);

            expect(response).to.deep.equals({
                data: {
                    hits: ["hit", "hit"]
                },
                status: 200
            });
            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equals(url);
            expect(axiosStub.firstCall.args[1]).to.be.undefined;
            expect(axiosStub.firstCall.args[2]).to.have.nested.include({
                "headers.Content-Type": "application/json;charset=UTF-8"
            });
        });
    });

    describe("resultEventsToObject", () => {
        it("should convert result events to an object structure", () => {
            const resultEvents = {
                onClick: ["setMarker", "zoomToResult"],
                onHover: ["setMarker"]
            };

            expect(SearchInterface1.resultEventsToObject(resultEvents)).to.deep.equals({
                onClick: {
                    setMarker: {},
                    zoomToResult: {}
                },
                onHover: {
                    setMarker: {}
                }
            });
        });
    });
});
