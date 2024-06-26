import { createStore } from "vuex";
import { config, shallowMount } from "@vue/test-utils";
import { expect } from "chai";
import sinon from "sinon";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Map from "ol/Map";

import ListItem from "../../../components/ListItem.vue";

config.global.mocks.$t = (key) => key;

describe("src_3_0_0/shared/modules/list/components/ListItem.vue", () => {
  const olFeature = new Feature(),
    props = {
      identifier: "Spongebob",
      tableHeads: {
        x: "x",
        y: "y",
        z: "z",
      },
      tableData: [],
      geometryName: "qwertz",
    };
  let store;

  before(() => {
    olFeature.set("x", "Gary");
    olFeature.set("y", "Patrick");
    olFeature.set("z", "Thaddaeus");

    props.tableData.push(olFeature);
  });

  beforeEach(() => {
    store = createStore({
      namespaces: true,
      modules: {
        Maps: {
          namespaced: true,
          actions: {
            placingPointMarker: sinon.stub(),
            zoomToExtent: sinon.spy(),
          },
        },
      },
    });

    mapCollection.addMap(new Map(), "2D");
  });

  afterEach(sinon.restore);

  it("should zoom to extent of a given feature", async () => {
    const wrapper = shallowMount(ListItem, {
        global: {
          plugins: [store],
        },
        props: props,
      }),
      feature = new Feature(),
      spyZoomToExtent = sinon.spy(wrapper.vm, "zoomToExtent");

    feature.setGeometry(new Point([583805.011, 5923760.691]));
    wrapper.vm.setCenter([feature]);

    expect(spyZoomToExtent.calledOnce).to.be.true;
    expect(spyZoomToExtent.firstCall.args).to.eql([
      {
        extent: [583805.011, 5923760.691, 583805.011, 5923760.691],
        options: {
          maxZoom: 5,
          padding: [5, 5, 5, 5],
        },
      },
    ]);
  });

  it("should zoom to combined extent of given features in multiSelect mode", async () => {
    const wrapper = shallowMount(ListItem, {
        global: {
          plugins: [store],
        },
        props: props,
      }),
      featureOne = new Feature(),
      featureTwo = new Feature(),
      coordsOne = [583805.011, 5923760.691],
      coordsTwo = [683804.011, 6923761.691],
      spyZoomToExtent = sinon.spy(wrapper.vm, "zoomToExtent");

    featureOne.setGeometry(new Point(coordsOne));
    featureTwo.setGeometry(new Point(coordsTwo));
    wrapper.vm.setCenter([featureOne, featureTwo]);

    expect(spyZoomToExtent.calledOnce).to.be.true;
    expect(spyZoomToExtent.firstCall.args).to.eql([
      {
        extent: [583805.011, 5923760.691, 683804.011, 6923761.691],
        options: {
          maxZoom: 5,
          padding: [5, 5, 5, 5],
        },
      },
    ]);
  });
});
