import { generateSimpleMutations } from "../../../shared/js/utils/generators";
import stateLayerSlider from "./stateLayerSlider";

const mutations = {
  ...generateSimpleMutations(stateLayerSlider),

  /**
   * Setter for the activeLayer.
   * The current progressbar is also set by the layerId index.
   * @param {Object} state the state
   * @param {Object} layerId The layer id.
   * @returns {void}
   */
  setActiveLayer(state, layerId) {
    state.currentProgressBarWidth = `width: ${state.progressBarWidth}%; margin-left: ${state.progressBarWidth * layerId.index}%`;
    state.activeLayer = layerId;
  },

  /**
   * Setter for the progressbar width.
   * @param {Object} state the state
   * @param {Object[]} layerIds The configuration of the layers from config.json.
   * @returns {void}
   */
  setProgressBarWidth(state, layerIds) {
    state.progressBarWidth = 100 / layerIds.length;
  },

  /**
   * Setter of the windows interval.
   * @param {Object} state the state
   * @param {Function} intervalFunction Function to be executed in this.
   * @returns {void}
   */
  setWindowsInterval(state, intervalFunction) {
    if (intervalFunction === null) {
      clearInterval(state.windowsInterval);
      state.windowsInterval = null;
    } else {
      state.windowsInterval = setInterval(intervalFunction, state.timeInterval);
    }
  },

  /**
   * Resets the active layer to default value.
   * The current progressbar is also set to the default value.
   * @param {Object} state the state
   * @returns {void}
   */
  resetActiveLayer(state) {
    state.currentProgressBarWidth = "width: 0%; margin-left: 0%";
    state.activeLayer = {
      layerId: "",
      index: -1,
    };
  },
};

export default mutations;
