/* eslint-disable no-console */
const {PORTALCONFIG_OLD} = require("./constants"),
    {removeAttributesFromTools} = require("./utils");

module.exports = function createMainMenu (data, configJS, migratedTools, toRemoveFromTools) {
    console.info("mainMenu");
    const mainMenu = {
        expanded: true,
        sections: [[], []]
    };

    addTitle(data, mainMenu);
    addSearchbar(data, mainMenu);
    fillMainSections(data, configJS, mainMenu, migratedTools, toRemoveFromTools);

    return mainMenu;
};

/**
 * Fills the menu sections of main menu with print, openConfig, legend, shareView, contact and language.
 * @param {Object} data parsed config.json content
 * @param {Object} configJS content of the config.js file
 * @param {Object} mainMenu v3 main menu object
 * @param {Array} migratedTools already migrated v2 tools
 * @param {Object} toRemoveFromTools attributes to remove from tools by type
 * @returns {void}
 */
function fillMainSections (data, configJS, mainMenu, migratedTools, toRemoveFromTools) {
    console.info("   tools");
    const menu = data[PORTALCONFIG_OLD].menu,
        tools = menu.tools?.children,
        firstSection = mainMenu.sections[0],
        secondSection = mainMenu.sections[1];
    let contact = null;

    if (tools?.print) {
        console.info("       print");
        const print = {...tools.print};

        print.type = "print";
        removeAttributesFromTools(toRemoveFromTools, print);
        firstSection.push(print);
        migratedTools.push("print");
    }

    Object.entries(menu).forEach(([menuName, menuConfig]) => {
        if (!["info", "tree", "ansichten", "tools"].includes(menuName) && !migratedTools.includes(menuName)) {
            const config = {...menuConfig};

            config.type = menuName;
            removeAttributesFromTools(toRemoveFromTools, config);
            if (menuName === "contact") {
                config.fileUpload = true;
                contact = config;
            }
            else if (menuName !== "filter") {
                console.info("       " + menuName);
                firstSection.push(config);
                migratedTools.push(menuName);
            }
        }
    });

    console.info("       shareView");
    firstSection.push({
        type: "shareView"
    });

    // second section
    if (contact) {
        console.info("       contact");
        secondSection.push(contact);
        migratedTools.push("contact");
    }
    console.info("       news");
    secondSection.push({
        type: "news"
    });
    if (configJS.portalLanguage?.enabled) {
        console.info("       language");
        secondSection.push({
            type: "language"
        });
        migratedTools.push("language");
    }
    console.info("--- HINT: add nested folders to menu containing menu entries by using type 'folder'.");
    console.info("--- HINT: display HTML or excute action or open url by using type 'customMenuElement'.");
}

/**
 * Adds searchbar entries.
 * @param {Object} data parsed config.json content
 * @param {Object} mainMenu v3 main menu object
 * @returns {void}
 */
function addSearchbar (data, mainMenu) {
    if (data[PORTALCONFIG_OLD].searchBar) {
        const oldSearchbar = data[PORTALCONFIG_OLD].searchBar,
            newSearchbar = {
                searchInterfaces: []
            };

        Object.entries(oldSearchbar).forEach(([searchName, searchConfig]) => {
            if (typeof searchConfig === "object") {
                let searchType = searchName;

                if (searchConfig.minChars === 3) {
                    delete searchConfig.minchars;
                }
                if (searchName === "tree") {
                    searchType = "topicTree";
                }
                searchConfig.type = searchType;
                console.info("   searchbar entry " + searchType);
                newSearchbar.searchInterfaces.push(searchConfig);
            }
        });
        mainMenu.searchBar = newSearchbar;
    }
    else {
        console.warn("  no 'searchBar' found");
    }
}

/**
 * Adds title to main menu and fills it if content of titwl is available in v2 data.
 * @param {Object} data parsed config.json content
 * @param {Object} mainMenu v3 main menu object
 * @returns {void}
 */
function addTitle (data, mainMenu) {
    let newTitle = {};

    if (data[PORTALCONFIG_OLD].portalTitle) {
        const oldTitle = data[PORTALCONFIG_OLD].portalTitle,
            oldTitleText = oldTitle.title;

        newTitle = oldTitle;
        newTitle.text = oldTitleText || "title.text is missing";
        delete newTitle.title;
    }
    else {
        console.warn("  no 'portalTitle' to migrate found - fill mainMenu/title with placeholder");
        newTitle.text = "Titel des Portals";
        newTitle.logo = "";
        newTitle.link = "";
        newTitle.toolTip = "toolTip";
    }
    mainMenu.title = newTitle;
    console.info("   title");
}
