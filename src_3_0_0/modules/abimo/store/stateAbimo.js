/**
 * User type definition
 * @module modules/Abimo/state
 * @typedef {Object} abimoState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon next to name (config-param).
 * @property {String} name name of this module
 * @property {Object[]} menuSide Specifies in which menu the module should be rendered
 */
export default {
  description: "common:modules.abimo.description",
  icon: "bi-geo-fill",
  name: "common:modules.abimo.name",
  menuSide: "mainMenu",
};
