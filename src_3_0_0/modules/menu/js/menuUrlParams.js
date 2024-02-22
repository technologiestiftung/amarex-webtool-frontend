import store from "../../../app-store";
import changeCase from "../../../shared/js/utils/changeCase";
import processUrlParams from "../../../shared/js/utils/processUrlParams";

/**
 * Here the urlParams for the menu are processed.
 *
 * Examples:
 * - https://localhost:9001/portal/master/?MENU={%22main%22:{%22currentComponent%22:%22root%22},%22secondary%22:{%22currentComponent%22:%22measure%22,%22attributes%22:{%22selectedGeometry%22:%22Polygon%22,%22selectedUnit%22:%221%22}}}
 * - https://localhost:9001/portal/master/?MENU={%22main%22:{%22currentComponent%22:%22fileimport%22},%22secondary%22:{%22currentComponent%22:%22MeasURe%22,%22attributes%22:{%22selectedGeometry%22:%22Polygon%22,%22selectedUnit%22:%221%22}}}
 * - https://localhost:9001/portal/master/?isinitopen=draw
 * - https://localhost:9001/portal/master/?isinitopen=fileimport
 * - https://localhost:9001/portal/master/?STARTUPMODUL=fileimport
 */

const menuUrlParams = {
        MENU: setAttributesToComponent
    },
    legacyMenuUrlParams = {
        ISINITOPEN: isInitOpen,
        STARTUPMODUL: isInitOpen
    };

/**
 * Process the menu url params.
 * @returns {void}
 */
function processMenuUrlParams () {
    processUrlParams(menuUrlParams, legacyMenuUrlParams);
}

/**
 * Sets the current components to the menus and update the state of these.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setAttributesToComponent (params) {
    const menuParams = changeCase.upperCaseKeys(JSON.parse(params.MENU));

    Object.keys(menuParams).forEach(menuSide => {
        const menuSideParams = changeCase.upperCaseKeys(menuParams[menuSide]),
            {currentComponent, side} = getCurrentComponent(menuSideParams.CURRENTCOMPONENT),
            attributes = menuSideParams.ATTRIBUTES;

        if (side) {
            const type = changeCase.upperFirst(currentComponent.type);

            store.dispatch("Menu/activateCurrentComponent", {currentComponent, type, side});

            if (attributes) {
                store.dispatch("Menu/updateComponentState", {type, attributes});
            }
        }
        else if (menuSideParams.CURRENTCOMPONENT === "layerInformation" && attributes) {
            const layerId = attributes.layerInfo.id,
                layerConfig = store.getters.layerConfigById(layerId);

            store.dispatch("Menu/updateComponentState", {type: "LayerInformation", attributes});
            if (store.getters.styleListLoaded) {
                store.dispatch("Modules/LayerInformation/startLayerInformation", layerConfig, {root: true});
            }
            else {
                store.watch((state, getters) => getters.styleListLoaded, value => {
                    if (value) {
                        store.dispatch("Modules/LayerInformation/startLayerInformation", layerConfig, {root: true});
                    }
                });
            }
        }
    });
}

/**
 * Sets the current component to the menu.
 * @param {Object} params The found params.
 * @returns {void}
 */
function isInitOpen (params) {
    const {currentComponent, side} = getCurrentComponent(params.ISINITOPEN || params.STARTUPMODUL);

    if (side) {
        const type = changeCase.upperFirst(currentComponent.type);

        store.dispatch("Menu/activateCurrentComponent", {currentComponent, type, side});
    }
}

/**
 * Gets the current component and the related menu side in which the currentComponent is configured.
 * @param {String} searchType The search type.
 * @returns {Object} The current component and the related menu side.
 */
function getCurrentComponent (searchType) {
    const mainMenuComponent = findInSections(store.getters["Menu/mainMenu"]?.sections, searchType),
        secondaryMenuComponent = findInSections(store.getters["Menu/secondaryMenu"]?.sections, searchType);
    let side,
        currentComponent;

    if (mainMenuComponent) {
        currentComponent = mainMenuComponent;
        side = "mainMenu";
    }
    else if (secondaryMenuComponent) {
        currentComponent = secondaryMenuComponent;
        side = "secondaryMenu";
    }

    return {currentComponent, side};
}

/**
 * Find elements in sections by serch type.
 * @param {Object[]} sections Sections that are searched.
 * @param {String} searchType The search type.
 * @returns {Object} The found object.
 */
function findInSections (sections, searchType) {
    let currentComponent;

    sections.forEach(elements => {
        const element = findElement(elements, searchType);

        if (element) {
            currentComponent = element;
        }
    });

    return currentComponent;
}

/**
 * Find an element by search type.
 * @param {Object[]} elements Elements that are searched.
 * @param {String} searchType The search type.
 * @returns {Object} The found object.
 */
function findElement (elements, searchType) {
    let currentComponent;

    elements.forEach(element => {
        const type = element.type.toUpperCase();

        if (currentComponent) {
            return;
        }

        if (type === searchType.toUpperCase()) {
            currentComponent = element;
        }
        else if (type === "FOLDER") {
            currentComponent = findElement(element.elements, searchType);
        }
    });

    return currentComponent;
}

export default {
    processMenuUrlParams,
    setAttributesToComponent,
    isInitOpen,
    getCurrentComponent,
    findInSections,
    findElement
};
