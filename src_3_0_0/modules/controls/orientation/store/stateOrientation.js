/**
 * User type definition
 * @typedef {Object} FreezeState
 * @property {String} iconGeolocate Icon of the orientation geolocate button.
 * @property {String} iconGeolocatePOI Icon of the orientation geolocate POI button.
 * @property {String[]} poiDistances The distances in config.json.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {String} zoomMode The zoomMode in config.json.
 * @property {String} activeCategory The active tab in the overview table.
 * @property {String} geolocation The current geolocation.
 * @property {String} poiMode The mode for showing the nearby pois.
 * @property {String} poiModeCurrentPositionEnabled The status if poi mode is current position.
 * @property {String} position The current position.
 * @property {String} showPoi Wether POI should be shown.
 * @property {String} showPoiChoice Wether poi choice is activated.
 * @property {String} showPoiIcon Wether to show the poi icon.
 */
const state = {
    iconGeolocate: "geo-alt",
    iconGeolocatePOI: "record-circle",
    poiDistances: [],
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"],
    zoomMode: "once",

    activeCategory: "",
    geolocation: null,
    poiMode: "currentPosition",
    poiModeCurrentPositionEnabled: true,
    position: null,
    showPoi: false,
    showPoiChoice: false,
    showPoiIcon: false
};

export default state;

