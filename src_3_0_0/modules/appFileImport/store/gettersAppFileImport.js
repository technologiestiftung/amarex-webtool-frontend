
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import appFileImportState from "./stateAppFileImport";

const getters = {
    ...generateSimpleGetters(appFileImportState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
