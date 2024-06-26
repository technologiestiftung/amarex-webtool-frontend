/**
 * @typedef {Object} stateGraphicalSelect
 * @description creates a dropdown to select an area in a map by square, circle or polygon. Create it like this: new GraphicalSelectModel({id: "idOfTheCaller"}).
 * The id is used to react only on events of the caller, not on all components, that use a graphicalSelectModel.
 * @property {Boolean} active=false dropdown is open or closed
 * @property {String} name="Geometrie" name of the dropdown
 * @property {Boolean} hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} displayName="Geometrie auswählen" label of the dropdown
 * @property {String} snippetType="graphicalSelect" type of the dropdown values
 * @property {Object} drawInteraction=undefined the interaction to draw a square, circle or polygon
 * @property {Object} selectionElements=["Dropdown"] available gui selection elements
 * @property {Object} geographicValues={"Rechteck aufziehen": "Box", "Kreis aufziehen": "Circle", "Fläche zeichnen": "Polygon"} possible values
 * @property {String} currentValue="" contains the current geographic value for "Box",  "Circle" or "Polygon"
 * @property {String} tooltipMessage="Klicken zum Starten und Beenden" Meassage for tooltip
 * @property {String} tooltipMessagePolygon="Klicken um Stützpunkt hinzuzufügen" Message for tooltip
 * @property {ol.geojson} selectedAreaGeoJson={} the selected area as GeoJSON
 * @property {String} defaultSelection="" initiliazed value of the dropdown selection
 */
const state = {
  active: false,
  name: "Geometrie",
  hasMouseMapInteractions: true,
  displayName: "common:shared.modules.graphicalSelect.displayName",
  snippetType: "graphicalSelect",
  selectionElements: ["Dropdown"],
  geographicValues: ["Box", "Circle", "Polygon"],
  currentValue: "",
  tooltipMessage: "common:shared.modules.graphicalSelect.tooltipMessage",
  tooltipMessagePolygon:
    "common:shared.modules.graphicalSelect.tooltipMessagePolygon",
  selectedAreaGeoJson: undefined,
  defaultSelection: "",
};

export default state;
