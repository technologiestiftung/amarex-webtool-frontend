import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import alertState from "./stateAlerting";

export default {
    ...generateSimpleGetters(alertState),
    /**
     * This returns the alerts queue array grouped by the alerts' category property.
     * And show error-warning-success -Alerts before info and news
     * @param {Object} state state
     * @returns {Object[]} sortedAlerts
     */
    sortedAlerts: (state) => {
        const
            resultByCategory = {},
            results = [];

        state.alerts.forEach(singleAlert => {
            if (resultByCategory[singleAlert.category] === undefined) {
                resultByCategory[singleAlert.category] = [];
            }
            resultByCategory[singleAlert.category].push({...singleAlert});
        });

        Object.keys(resultByCategory).forEach(key => {
            results.push({category: key, content: resultByCategory[key]});
        });

        results.sort(function (a, b) {
            const sortingArr = ["success", "warning", "error"];

            return sortingArr.indexOf(b.category) - sortingArr.indexOf(a.category);
        });

        return results;
    }
};
