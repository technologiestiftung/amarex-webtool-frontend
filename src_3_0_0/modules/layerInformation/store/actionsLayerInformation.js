import getCswRecordById from "../../../shared/js/api/getCswRecordById";
import sortBy from "../../../shared/js/utils/sortBy";
import xml2json from "../../../shared/js/utils/xml2json";
import axios from "axios";

/**
 * The actions for the layerInformation.
 * @module modules/layerInformation/store/actionsLayerInformation
 */
export default {
    /**
     * Starts drawing layer information. If mobile and menu is closed, menu is opened.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} layerConf the layer configuration
     * @returns {void}
     */
    startLayerInformation ({commit, dispatch, rootGetters}, layerConf) {
        const name = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].md_name : layerConf.name,
            mdid = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].md_id : null;

        if (rootGetters["Modules/Legend/layerInfoLegend"].id !== layerConf.id) {
            commit("Modules/Legend/setLayerInfoLegend", {}, {root: true});
            dispatch("Modules/Legend/createLegendForLayerInfo", layerConf.id, {root: true});
        }
        if (rootGetters.isMobile && !rootGetters["Menu/expanded"]("mainMenu")) {
            dispatch("Menu/toggleMenu", "mainMenu", {root: true});
        }
        dispatch("Menu/changeCurrentComponent", {type: "layerInformation", side: "mainMenu", props: {name}}, {root: true});
        commit("setLayerInfo", layerConf);
        dispatch("setMetadataURL", mdid);
        dispatch("additionalSingleLayerInfo");
    },

    /**
     * get the layer Infos that aren't in the store but saved in the object
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @returns {void}
     */
    additionalSingleLayerInfo: async function ({dispatch, state}) {
        let metaId;

        if (typeof state.layerInfo.metaID === "string") {
            metaId = state.layerInfo.metaID;
        }
        else if (state.layerInfo.metaID) {
            metaId = state.layerInfo.metaID[0];
        }
        const cswUrl = state.layerInfo.cswUrl,
            customMetadata = state.layerInfo.customMetadata,
            attributes = state.layerInfo.attributes,
            metaInfo = {metaId, cswUrl, customMetadata, attributes};

        dispatch("getAbstractInfo", metaInfo);

    },

    /**
     * set all the abstract Infos for the layer
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} metaInfo the metaInformation that is necessary
     * @returns {void}
     */
    getAbstractInfo: async function ({commit, dispatch, state, rootGetters}, metaInfo) {
        let metadata;

        if (metaInfo.cswUrl !== null && typeof metaInfo.metaId !== "undefined") {
            metadata = await getCswRecordById.getRecordById(metaInfo.cswUrl, metaInfo.metaId);
        }
        // use default csw_url from rest-services.json if csw_url not stated in the specific service
        else if (Config.cswId !== null && typeof Config.cswId !== "undefined") {
            const service = rootGetters.restServiceById(Config.cswId);
            let metaURL = "";

            commit("setCustomText", null);
            if (service === undefined) {
                console.warn("Rest Service with the ID " + Config.cswId + " is not configured in rest-services.json!");
            }
            else {
                metaURL = service.url;
            }

            if (metaURL !== "" && typeof metaInfo.metaId !== "undefined") {
                metadata = await getCswRecordById.getRecordById(metaURL, metaInfo.metaId);
            }
        }
        else if (metaInfo.customMetadata) {
            const metadataAsJson = await axios.get(metaInfo.cswUrl)
                .then(response => xml2json(response.request.responseXML));

            metadata = getCswRecordById.getMetadata(metadataAsJson);
            dispatch("getCustomMetaData", {attributes: metaInfo.attributes, metadataAsJson});
        }

        if (typeof metadata === "undefined") {
            commit("setTitle", "");
            commit("setPeriodicityKey", "");
            commit("setDatePublication", "");
            commit("setAbstractText", i18next.t("common:modules.layerInformation.noMetadataLoaded"));
            commit("setNoMetadataLoaded", i18next.t("common:modules.layerInformation.noMetadataLoaded"));
        }
        else {
            commit("setTitle", metadata?.getTitle());
            commit("setAbstractText", metadata?.getAbstract());
            commit("setPeriodicityKey", metadata?.getFrequenzy());
            commit("setDownloadLinks", metadata?.getDownloadLinks());
            commit("setDatePublication", metadata?.getPublicationDate() || metadata?.getCreationDate());
        }

        if (state.downloadLinks) {
            const downloadLinks = [];

            state.downloadLinks.forEach(link => {
                downloadLinks.push(link);
            });
            commit("setDownloadLinks", sortBy(downloadLinks, "linkName"));
        }
    },

    /**
     * Get metadata from path declared in the service configuration
     * @param {Object} param.commit the commit
     * @param {Object} payload object of attributes with paths to metadata information and metadata as json
     * @returns {void}
     */
    getCustomMetaData: function ({commit}, payload) {
        const customMetadata = Object.entries(payload.attributes).map(([key, value]) => {
                return {[key]: value.split(".").reduce((o, i)=> o[i], payload.metadataAsJson).getValue()};
            }),
            singleObjectCustomMetadata = {};

        for (let i = 0; i < customMetadata.length; i++) {
            Object.assign(singleObjectCustomMetadata, customMetadata[i]);
        }
        commit("setCustomText", singleObjectCustomMetadata);
    },


    /**
     * Checks the array of metaIDs and creates array metaURL with complete URL for template. Does not allow duplicated entries
     * @param {Object} param.state the state
     * @param {Object} param.commit the commit
     * @param {Object} metaId the given metaId for one layer
     * @returns {void}
     */
    setMetadataURL ({state, commit, rootGetters}, metaId) {
        const metaURLs = [],
            metaDataCatalogueId = state.metaDataCatalogueId;
        let metaURL = "",
            service = null;

        service = rootGetters.restServiceById(metaDataCatalogueId);

        if (typeof state.layerInfo.showDocUrl !== "undefined" && state.layerInfo.showDocUrl !== null) {
            metaURL = state.layerInfo.showDocUrl + metaId;
        }
        else if (service !== undefined) {
            metaURL = service.url + metaId;
        }
        else {
            console.warn("Rest Service with the ID " + metaDataCatalogueId + " is not configured in rest-services.json!");
        }

        if (metaId !== null && metaId !== "" && metaURLs.indexOf(metaURL) === -1) {
            metaURLs.push(metaURL);
        }

        commit("setMetaURLs", metaURLs);
    },

    /**
     * set Parameters from configuration
     * @param {Object} param.commit - the commit
     * @param {Object} config - Configuration
     * @returns {void}
     */
    setConfigParams ({commit}, config) {
        if (config.layerInformation !== undefined && config.layerInformation.showUrlGlobal !== null) {
            commit("setShowUrlGlobal", config.layerInformation.showUrlGlobal);
        }
        else if (config.layerInformation === undefined) {
            commit("setShowUrlGlobal", undefined);
        }
    }
};
