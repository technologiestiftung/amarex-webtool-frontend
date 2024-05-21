import { generateSimpleGetters } from "../../../shared/js/utils/generators";
import stateAbimo from "./stateAbimo";

const getters = {
  ...generateSimpleGetters(stateAbimo),
};

export default getters;
