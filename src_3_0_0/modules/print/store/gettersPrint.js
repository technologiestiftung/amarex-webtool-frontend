import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import statePrint from "./statePrint";

const getters = {
    ...generateSimpleGetters(statePrint),

    urlParams: state => {
        const params = {
            autoAdjustScale: state.autoAdjustScale,
            currentFormat: state.currentFormat,
            currentLayoutName: state.currentLayoutName,
            currentScale: state.currentScale,
            dpiForPdf: state.dpiForPdf,
            title: state.title
        };

        return params;
    }
};

export default getters;
