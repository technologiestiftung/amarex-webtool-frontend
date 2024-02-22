import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateLayerClusterToggler from "./stateLayerClusterToggler";

const getters = {
    ...generateSimpleGetters(stateLayerClusterToggler),

    /**
     * Returns the layernames of the layer id list.
     * @param {Object} state context object.
     * @param {Object} _ layerClusterToggler store getters
     * @param {Object} __ root state
     * @param {Object} rootGetters root getters
     * @returns {String[]} The layer names of the layer id list.
     */
    layerNames: (state, _, __, rootGetters) => {
        const layerNames = [];

        state.layerIdList.forEach(layerId => {
            layerNames.push(rootGetters.layerConfigById(layerId)?.name);
        });

        return layerNames;
    }
};

export default getters;
