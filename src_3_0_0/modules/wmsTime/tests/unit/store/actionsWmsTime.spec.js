import sinon from "sinon";
import {expect} from "chai";

import actions from "../../../store/actionsWmsTime";
import initialState from "../../../store/stateWmsTime";
import layerCollection from "../../../../../core/layers/js/layerCollection";

describe("src_3_0_0/modules/wmsTime/store/actionsWmsTime.js", () => {
    let commit, dispatch, getters, state, map;

    before(() => {
        mapCollection.clear();
        map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            currentTimeSliderObject: {keyboardMovement: 5}
        };
        map.removeLayer = sinon.spy();
        sinon.stub(layerCollection, "getOlLayers").returns(
            [
                {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}
            ]
        );
    });

    afterEach(sinon.restore);

    describe("toggleSwiper", () => {
        let id,
            commitSpy;

        /**
         * If the mutation 'setLayerSwiperActive' is called, the value needs to be actually changed
         * for the rest of the function to work.
         * Otherwise the function simply calls a spy.
         *
         * @param {String} mutation Name of the mutation that would be called.
         * @param {boolean/number} payload The payload that would be set in the state.
         * @returns {void}
         */
        function commitWithReturn (mutation, payload) {
            if (mutation === "setLayerSwiperActive") {
                state.layerSwiper.active = payload;
            }
            commitSpy(mutation, payload);
        }

        beforeEach(() => {
            commit = commitWithReturn;
            commitSpy = sinon.spy();
            dispatch = sinon.spy();
            id = "someId";
            state = Object.assign({}, initialState);
            sinon.stub(layerCollection, "getLayerById").returns(
                {name: "bester Layer der Welt", values_: {id: "123"}, getSource: () => state.source, attributes: {name: "bester Layer", time: true, url: "www.abc.de"}}

            );
        });

        it("should trigger the Parser to add a layer, add said layer to the tree", async () => {
            await actions.toggleSwiper({commit, state, dispatch}, id);

            expect(commitSpy.called).to.be.true;
            expect(commitSpy.firstCall.args).to.eql(["setLayerSwiperActive", true]);
            expect(commitSpy.secondCall.args[0]).to.eql("setLayerSwiperSourceLayer");
            expect(commitSpy.thirdCall.args[0]).to.eql("setLayerSwiperTargetLayer");
        });
        it("should call remove the second layer from the Map, remove it from the tree", () => {
            id += state.layerAppendix;

            state.layerSwiper.active = true;
            actions.toggleSwiper({commit, state, dispatch}, id);

            expect(commitSpy.called).to.be.true;
            expect(commitSpy.firstCall.args).to.eql(["setLayerSwiperActive", false]);
            expect(dispatch.called).to.be.true;
        });
    });

    describe("moveSwiper", () => {
        it("should call the functions to set the swiper according to the x-coordinate of the keydown and ArrowRight event", () => {
            const event = {
                type: "keydown",
                key: "ArrowRight",
                clientX: 750
            };

            state.layerSwiper.valueX = 750;
            state.layerSwiper.isMoving = true;

            actions.moveSwiper({state, commit, dispatch, getters}, event);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setLayerSwiperValueX", 755]);
            expect(commit.secondCall.args).to.eql(["setLayerSwiperStyleLeft", 755]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateMap"]);
        });
        it("should call the functions to set the swiper according to the x-coordinate of the mousemove event", () => {
            const event = {
                type: "mousemove",
                clientX: 800
            };

            state.layerSwiper.valueX = 750;
            state.layerSwiper.isMoving = true;

            actions.moveSwiper({state, commit, dispatch, getters}, event);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setLayerSwiperValueX", 800]);
            expect(commit.secondCall.args).to.eql(["setLayerSwiperStyleLeft", 800]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateMap"]);
        });
    });

    describe("windowWidthChanged", () => {
        beforeEach(() => {
            state.timeSlider.currentLayerId = "123";
        });

        it("should call the mutation to set the windowWidth", () => {
            actions.windowWidthChanged({commit, dispatch, state, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWindowWidth"]);
        });
        it("should set the windowWidth and toggle the swiper if conditional is met", () => {
            state.layerSwiper.active = true;

            actions.windowWidthChanged({commit, dispatch, state, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWindowWidth"]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["toggleSwiper", "123_secondLayer"]);
        });
    });
});
