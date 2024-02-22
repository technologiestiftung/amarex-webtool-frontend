import store from "../app-store";
import main from "../main";
import Vue from "vue";

/* eslint-disable no-undef */
const allAddons = typeof VUE_ADDONS !== "undefined" ? VUE_ADDONS : {};

/**
 * Adds all addons based on config.js and addonsConf.json to the Vue Instance and store
 * @param {String[]} config The array of addonKeys specified in config.js
 * @returns {void}
 */
async function loadAddons (config) {
    main.getApp().config.globalProperties.$controlAddons = [];
    main.getApp().config.globalProperties.$gfiThemeAddons = [];
    main.getApp().config.globalProperties.$searchInterfaceAddons = [];
    main.getApp().config.globalProperties.$toolAddons = [];

    if (config) {
        const addons = config.map(async addonKey => {
            try {
                const addonConf = allAddons[addonKey];

                if (addonConf && Object.prototype.hasOwnProperty.call(addonConf, "type")) {
                    if (addonConf.type === "control") {
                        await loadControls(addonKey);
                    }
                    else if (addonConf.type === "gfiTheme") {
                        await loadGfiThemes(addonKey);
                    }
                    else if (addonConf.type === "searchInterface") {
                        await loadSearchInterfaces(addonKey);
                    }
                    else if (addonConf.type === "tool") {
                        await loadToolAddons(addonKey);
                    }
                }
            }
            catch (e) {
                console.warn(e);
                console.warn(`The module ${addonKey} does not include a Vue-component and/or vuex-store-module. Please make sure the folder contains a ${addonKey}.vue and ${addonKey}.js file. Maybe it is an backbone-addon.`, e);
            }
        });

        await Promise.all(addons);
    }
}
/**
 * Loads the control and creates the Vue component and adds it to Vue instance globally
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
async function loadControls (addonKey) {
    const addon = await loadAddon(addonKey),
        name = addon.component.name.charAt(0).toLowerCase() + addon.component.name.slice(1);

    Vue.component(addon.component.name, addon.component);
    if (addon.store) {
        // register the vuex store module
        store.registerModule(["controls", addon.component.name], addon.store);
    }
    store.commit("Controls/registerControl", {name: name, control: addon.component});
    main.getApp().config.globalProperties.$controlAddons.push(name);
}

/**
 * Loads the gfi themes and creates the Vue component and adds it to Vue instance globally
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
async function loadGfiThemes (addonKey) {
    const addon = await loadAddon(addonKey),
        addonName = addon.component.name.charAt(0).toLowerCase() + addon.component.name.slice(1);

    main.getApp().component(addon.component.name, addon.component);
    // Add the componentName to a global array on vue instance called $gfiThemeAddons
    main.getApp().config.globalProperties.$gfiThemeAddons.push(addon.component.name);
    // register the vuex store module
    if (addon.store) {
        store.registerModule(["Modules", addon.component.name], addon.store);
        // register the component
        moduleCollection[addonName] = addon.component;
    }
}

/**
 * Load searchInterface and register store when it exists.
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
async function loadSearchInterfaces (addonKey) {
    const addon = await loadAddon(addonKey);

    main.getApp().config.globalProperties.$searchInterfaceAddons.push(addon);
}

/**
 * Creates the Vue component and adds it to Vue instance globally.
 * Registers the store at "Modules" and adds the local-files.
 * @param {String} addonKey specified in config.js
 * @returns {void}
 */
async function loadToolAddons (addonKey) {
    const addon = await loadAddon(addonKey),
        addonName = addon.component.name.charAt(0).toLowerCase() + addon.component.name.slice(1);
    // Add the addonKey to a global array on vue instance

    main.getApp().config.globalProperties.$toolAddons.push(addon.component.name);
    // register the vuex store module
    store.registerModule(["Modules", addon.component.name], addon.store);
    // register the component
    moduleCollection[addonName] = addon.component;
}

/**
 * Loads the addon with locales.
 * @param {String} addonKey specified in config.js
 * @returns {Object} The addon.
 */
async function loadAddon (addonKey) {
    const addonModule = await import(
        /* webpackChunkName: "[request]" */
        /* webpackInclude: /addons[\\\/].*[\\\/]index.js$/ */
        /* webpackExclude: /(node_modules)|(.+unittests.)|(.+test.)+/ */
            `../../addons/addons_3_0_0/${allAddons[addonKey].entry}`
        ),
        addon = addonModule.default;

    // Add the locale
    for (const localeKey in addon.locales) {
        i18next.addResourceBundle(localeKey, "additional", addon.locales[localeKey], true);
    }
    return addon;
}

export default {
    loadAddons,
    loadControls,
    loadGfiThemes,
    loadSearchInterfaces,
    loadToolAddons,
    loadAddon
};

