import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import state from "./stateBufferAnalysis";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
