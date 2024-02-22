/**
 * Contains actions that are directly related to the components resultList and resultListItem.
 * @module modules/searchBar/store/actions/actionsSearchBarResultList
 */
export default {
    /**
     * Activate click action(s) of searchResult.
     * Update the input field for onClick events.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} searchResult The search result.
     * @param {String} actionType The action type onHover or onClick.
     * @returns {void}
     */
    activateActions ({commit, dispatch}, {searchResult, actionType}) {
        const events = searchResult.events[actionType] || {};

        Object.keys(events).forEach(event => {
            dispatch(event, events[event]);
        });

        if (actionType === "onClick") {
            commit("setSearchInput", searchResult.name);
        }
    },

    /**
     * Activate action with action arguments.
     * @param {Object} param.dispatch the dispatch
     * @param {String} actionName The action name.
     * @param {String} actionArgs The action arguments.
     * @returns {void}
     */
    activateAction ({dispatch}, {actionName, actionArgs}) {
        dispatch(actionName, actionArgs);
    }
};
