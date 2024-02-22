import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import shareViewState from "./stateShareView";

/**
 * Checks if the attributes can be converted to a string. if not, an error message is displayed and the attributes are removed from the params.
 * @param {Object} menu The menu params.
 * @returns {void}
 */
function areAttributesValid (menu) {
    try {
        JSON.stringify(menu.attributes);
    }
    catch (error) {
        delete menu.attributes;
        console.error(`Parsing the attributes of the module: ${menu.currentComponent} into a string failed. The attributes were removed due to the following error message: ${error}`);
    }
}

const getters = {
    ...generateSimpleGetters(shareViewState),

    /**
     * @param {Object} _ shareView store state.
     * @param {Object} __ shareView store getters.
     * @param {Object} ___ root state.
     * @param {Object} rootGetters root getters.
     * @returns {String} The Url that can be copied by the user.
     */
    url (_, __, ___, rootGetters) {
        const layerParams = rootGetters.layerUrlParams,
            mapParams = rootGetters["Maps/urlParams"],
            menuParams = rootGetters["Menu/urlParams"];
        let shareUrl = location.origin + location.pathname + "?";

        if (menuParams.main.currentComponent === "shareView") {
            menuParams.main.currentComponent = "root";
            delete menuParams.main.attributes;
        }
        else if (menuParams.secondary.currentComponent === "shareView") {
            menuParams.secondary.currentComponent = "root";
            delete menuParams.secondary.attributes;
        }

        areAttributesValid(menuParams.main);
        areAttributesValid(menuParams.secondary);

        shareUrl = shareUrl + mapParams;
        shareUrl = `${shareUrl}&MENU=${JSON.stringify(menuParams)}`;
        shareUrl = `${shareUrl}&LAYERS=${JSON.stringify(layerParams)}`;

        return shareUrl;
    }
};

export default getters;
