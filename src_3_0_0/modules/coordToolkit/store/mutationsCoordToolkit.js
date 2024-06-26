import { generateSimpleMutations } from "../../../shared/js/utils/generators";
import coordState from "./stateCoordToolkit";

/**
 * The mutations for the CoodToolkit.
 * @module modules/coordToolkit/store/mutationsCoordToolkit
 */
export default {
  /**
   * Creates from every state-key a setter.
   * For example, given a state object {key: value}, an object
   * {setKey:   (state, payload) => *   state[key] = payload * }
   * will be returned.
   */
  ...generateSimpleMutations(coordState),
  /**
   * Set currect projection to one in the list of projections.
   * @param {Object} state state of this module
   * @param {Object[]} [projections=[]] list of available projections
   * @returns {void}
   */
  setProjections: (state, projections = []) => {
    const found = projections.filter(
      (projection) => projection.id === state.currentProjection?.id,
    );

    if (found.length === 0) {
      // EPSG:25832 must be the first one
      const firstProj = projections.find(
        (proj) => proj.name.indexOf("25832") > -1,
      );

      if (firstProj) {
        const index = projections.indexOf(firstProj);

        projections.splice(index, 1);
        projections.unshift(firstProj);
      }
      state.currentProjection = projections[0];
    }
    state.projections = projections;
  },
  /**
   * Sets the example values to state.
   * @param {Object} state state of this module
   * @returns {void}
   */
  setExample(state) {
    if (state.currentProjection) {
      if (
        state.currentProjection.id ===
        "http://www.opengis.net/gml/srs/epsg.xml#4326"
      ) {
        state.coordinatesEastingExample = "53° 33′ 25″";
        state.coordinatesNorthingExample = "9° 59′ 50″";
      } else if (
        state.currentProjection.id ===
        "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"
      ) {
        state.coordinatesEastingExample = "53.55555°";
        state.coordinatesNorthingExample = "10.01234°";
      } else if (
        state.currentProjection.id ===
        "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3"
      ) {
        state.coordinatesEastingExample = "3564459.13";
        state.coordinatesNorthingExample = "5935103.67";
      } else {
        state.coordinatesEastingExample = "564459.13";
        state.coordinatesNorthingExample = "5935103.67";
      }
    }
  },
  /**
   * Resets the northing or easting error messages  in the state which is used for live validation of input.
   * @param {Object} state state of this module
   * @param {Boolean} id if id === "northing" northing-messages are resetted, if id === "easting" easting-messages, else if id === "all" all messages are resetted
   * @returns {void}
   */
  resetErrorMessages: (state, id) => {
    if (id === "northing") {
      state.northingNoCoord = false;
      state.northingNoMatch = false;
    } else if (id === "easting") {
      state.eastingNoCoord = false;
      state.eastingNoMatch = false;
    } else if (id === "all") {
      state.eastingNoCoord = false;
      state.eastingNoMatch = false;
      state.northingNoCoord = false;
      state.northingNoMatch = false;
    }
  },
  /**
   * Resets the coordinate values in the state.
   * @param {Object} state state of this module
   * @returns {void}
   */
  resetValues: (state) => {
    state.coordinatesEasting.value = "";
    state.coordinatesNorthing.value = "";
  },
  /**
   * Pushes the coordinates to the selectedCoordinates in the state.
   * @param {Object} state state of this module
   * @param {Object} coordinates the formatted coordinates
   * @returns {void}
   */
  pushCoordinates: (state, coordinates) => {
    state.selectedCoordinates.push(coordinates);
  },
};
