import { generateSimpleGetters } from "../../../shared/js/utils/generators";
import scaleSwitcherState from "./stateScaleSwitcher";

const getters = {
  ...generateSimpleGetters(scaleSwitcherState),

  // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
