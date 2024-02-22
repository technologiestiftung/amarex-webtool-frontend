import {expect} from "chai";
import sinon from "sinon";
import axios from "axios";
import utils from "../../js/utilsAxios";

describe("src_3_0_0/modules/login/js/utilsAxois.js", () => {
    let originalXMLHttpRequestOpen,
        originalFetch;

    beforeEach(() => {
        sinon.stub(axios.interceptors.request, "use");
        originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = sinon.stub();
        originalFetch = window.fetch;
        window.fetch = sinon.stub().returns(Promise.resolve({ok: true}));
    });

    afterEach(() => {
        axios.interceptors.request.use.restore();
        XMLHttpRequest.prototype.open = originalXMLHttpRequestOpen;
        window.fetch = originalFetch;
    });

    it("should add Axios request interceptor for URLs matching the regex", () => {
        const token = "your_bearer_token",
            interceptorUrlRegex = /example\.com/;

        utils.addInterceptor(token, interceptorUrlRegex);

        expect(axios.interceptors.request.use.called).to.be.true;
    });

    it("should add XMLHttpRequest interceptor for URLs matching the regex", () => {
        const token = "your_bearer_token",
            interceptorUrlRegex = /example\.com/,
            xhr = new XMLHttpRequest();

        utils.addInterceptor(token, interceptorUrlRegex);

        expect(XMLHttpRequest.prototype.open).to.be.a("function");

        xhr.open("GET", "http://example.com/api");
        expect(() => xhr.open("GET", "http://example.com/api")).to.not.throw();
    });

    it("should add fetch interceptor for URLs matching the regex", async () => {
        const token = "your_bearer_token",
            interceptorUrlRegex = /example\.com/,
            response = await window.fetch("http://example.com/api");

        utils.addInterceptor(token, interceptorUrlRegex);

        expect(window.fetch).to.be.a("function");
        expect(response).to.be.ok;
    });
});

