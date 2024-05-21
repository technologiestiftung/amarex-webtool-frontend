import { generateSimpleMutations } from "../../../shared/js/utils/generators";
import stateAbimo from "./stateAbimo";

const mutations = {
  ...generateSimpleMutations(stateAbimo),
};

export default mutations;
