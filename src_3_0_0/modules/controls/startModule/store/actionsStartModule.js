import changeCase from "../../../../shared/js/utils/changeCase";

const actions = {
    /**
     * Gets the module state.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootState the rootState
     * @param {Object} payload The payload.
     * @param {Object[]} payload.menuModels The configured modules by menu.
     * @param {String} payload.menuSide The menu side.
     * @returns {void}
     */
    setConfiguredModuleStates ({commit, dispatch, rootState}, {menuModels, menuSide}) {
        menuModels.forEach(module => {
            if (module?.type) {
                dispatch("extendModuleState", {module, menuSide});
                commit("addConfiguredModel", {
                    menuSide: menuSide,
                    state: rootState.Modules[changeCase.upperFirst(module.type)]
                });
            }
        });
    },

    /**
     * Add attributes to module state, because to show in menu.
     * @param {Object} param store context
     * @param {Object} param.rootState the rootState
     * @param {Object} payload The payload.
     * @param {Object} payload.module The module.
     * @param {String} payload.menuSide The menu side.
     * @returns {void}
     */
    extendModuleState ({rootState}, {module, menuSide}) {
        rootState.Modules[changeCase.upperFirst(module.type)] = {
            ...rootState.Modules[changeCase.upperFirst(module.type)],
            ...{
                menuSide: menuSide
            },
            ...module
        };
    },

    /**
     * Activates or deactivates the associated module of the clicked control.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the commit
     * @param {Object} payload The payload.
     * @param {Object} payload.moduleState The vuex states the clicked module-control.
     * @param {String} payload.menuSide The menu side.
     * @returns {void}
     */
    onClick ({commit, dispatch, rootGetters}, {moduleState, menuSide}) {
        const menuCurrentComponent = "Menu/currentComponent";

        if (rootGetters[menuCurrentComponent](menuSide).type !== moduleState.type) {
            const menuExpanded = "Menu/expanded";

            dispatch("Menu/changeCurrentComponent", {type: moduleState.type, side: menuSide, props: {name: moduleState.name}}, {root: true});

            if (!rootGetters[menuExpanded](menuSide)) {
                dispatch("Menu/toggleMenu", menuSide, {root: true});
            }
        }
        else {
            commit("Menu/switchToRoot", menuSide, {root: true});
        }
    }
};

export default actions;
