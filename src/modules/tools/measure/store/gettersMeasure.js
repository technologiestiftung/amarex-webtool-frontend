import stateMeasure from "./stateMeasure";

import {generateSimpleGetters} from "../../../shared/js/utils/generators";

const getters = {
    ...generateSimpleGetters(stateMeasure),

    /**
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @returns {String[]} options for geometry selection
     */
    geometryValues ({geometryValues3d, geometryValues}, _, __, rootGetters) {
        return rootGetters["Maps/is3D"]
            ? geometryValues3d
            : geometryValues;
    },
    /**
     * @param {object} state measure store state
     * @param {object} _ measure store getters
     * @param {object} __ root state
     * @param {object} rootGetters root getters
     * @returns {String} selected geometry selection option
     */
    selectedGeometry ({geometryValues3d, selectedGeometry}, _, __, rootGetters) {
        return rootGetters["Maps/is3D"]
            ? geometryValues3d[0] // 3D mode only has one option
            : selectedGeometry;
    }

};

export default getters;
