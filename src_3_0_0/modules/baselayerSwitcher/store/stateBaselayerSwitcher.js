/**
 * User type definition
 * @property {Boolean} active Status of baslayerSwitcher, as configured in config.json
 * @property {Boolean} activatedExpandable Defines if baselayerSwichter is expandend
 * @property {Object} baselayerIds Ids of the baselayers form config
 * @property {String[]} configPaths Path array of possible config locations. First one found will be used
 * @property {Object}  topBaselayerId Id of the baselayer that is on the top (highest zIndex)
 * @property {String} type The type of the baselayerSwitcher component
 */
const state = {
    active: false,
    activatedExpandable: false,
    baselayerIds: [],
    configPaths: ["portalConfig.map.baselayerSwitcher"],
    topBaselayerId: null,
    type: "baselayerSwitcher"
};

export default state;
