import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateLayerInformation from "./stateLayerInformation";

/**
 * The mutations for the layerInformation.
 * @module modules/layerInformation/store/mutationsLayerInformation
 */
export default {
    ...generateSimpleMutations(stateLayerInformation),

    /**
     * Sets the layerinfo of the active layer.
     * @param {Object} state Context object.
     * @param {Object} layerConf The layer configuration.
     * @returns {void}
     */
    setLayerInfo (state, layerConf) {
        state.layerInfo = {
            cswUrl: layerConf?.datasets?.length > 0 ? layerConf.datasets[0].csw_url : null,
            id: layerConf?.id,
            layername: layerConf?.name,
            legendURL: layerConf?.legendURL,
            metaID: layerConf?.datasets?.length > 0 ? layerConf.datasets[0].md_id : null,
            customMetadata: layerConf?.datasets?.length > 0 ? layerConf.datasets[0].customMetadata : null,
            attributes: layerConf?.datasets?.length > 0 ? layerConf.datasets[0].customMetadata : null,
            showDocUrl: layerConf?.datasets?.length > 0 ? layerConf.datasets[0].attributes : null,
            typ: layerConf?.typ,
            url: layerConf?.url || layerConf?.capabilitiesUrl,
            urlIsVisible: layerConf?.urlIsVisible
        };
    }
};
