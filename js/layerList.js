import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";

/**
 * Holt sich die Layer Konfigurationen (layer list)
 * @param {string} layerConfUrl - services.json url
 * @returns {void}
 */
export function fetch (layerConfUrl) {
    rawLayerList.initializeLayerList(layerConfUrl,
        (layerList, error) => {
            if (error) {
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Die Datei '" + layerConfUrl + "' konnte nicht geladen werden!</strong>",
                    kategorie: "alert-warning"
                });
            }
            // else {
            //     modifyLayerList(layerList);
            // }
        });
}

