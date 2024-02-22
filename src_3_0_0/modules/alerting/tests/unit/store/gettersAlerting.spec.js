import getters from "../../../store/gettersAlerting";
import {expect} from "chai";

describe("src_3_0_0/modules/alerting/store/gettersAlerting.js", () => {

    it("fetchBroadcastUrl", async function () {
        const state = {
                fetchBroadcastUrl: "https://fetchBroadcastUrl"
            },
            checkValue = getters.fetchBroadcastUrl(state);


        expect(checkValue).to.eql("https://fetchBroadcastUrl");
    });
    it("localStorageDisplayedAlertsKey", async function () {
        const state = {
                localStorageDisplayedAlertsKey: "keyONE"
            },
            checkValue = getters.localStorageDisplayedAlertsKey(state);


        expect(checkValue).to.eql("keyONE");
    });
    it("displayedAlerts", async function () {
        const state = {
                displayedAlerts: ["a", "b", "c"]
            },
            checkValue = getters.displayedAlerts(state);


        expect(checkValue).to.eql(["a", "b", "c"]);
    });
    it("showTheModal", async function () {
        const state = {
                showTheModal: false
            },
            checkValue = getters.showTheModal(state);


        expect(checkValue).to.be.false;
    });
    it("alerts", async function () {
        const state = {
                alerts: ["info", "warning", "success", "error"]
            },
            checkValue = getters.alerts(state);


        expect(checkValue).to.eql(["info", "warning", "success", "error"]);
    });
    it("sortedAlerts - 1.error2.warning3.success4.other", async function () {
        const state = {
                alerts: [{category: "info"}, {category: "warning"}, {category: "success"}, {category: "error"}]
            },
            checkValue = getters.sortedAlerts(state);

        expect(checkValue[0].category).to.eql("error");
        expect(checkValue[1].category).to.eql("warning");
        expect(checkValue[2].category).to.eql("success");
        expect(checkValue[3].category).to.eql("info");
        expect(checkValue[4]).to.eql(undefined);
    });
});
