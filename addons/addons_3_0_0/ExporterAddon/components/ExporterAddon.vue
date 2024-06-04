<script>
import { mapGetters } from "vuex";
import JSZip from "jszip";
import sanitizeSelector from "../../../../src/utils/sanitizeSelector";
import exportLayerAsGeoJSON from "../utils/download";
import layerCollection from "../../../../src_3_0_0/core/layers/js/layerCollection";
import VectorLayer from "ol/layer/Vector";

/**
 * ExporterAddon
 * @description Exporter Addon
 * @module addons/ExporterAddon
 */
export default {
  name: "ExporterAddon",
  components: {
    // LayerDownloader,
  },
  data() {
    return {
      configToExport: null,
      fileSources: [],
      projectTitle: "",
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs", "Maps/projectionCode"]),
  },
  methods: {
    /**
     * Prepare config for download
     * @function prepareConfigForDownload
     * @returns {Promise}
     */
    async prepareConfigForDownload() {
      const targetPath = "config.json";
      const layers = await this.allLayerConfigs;

      // todo: add portalConfig

      try {
        const response = await fetch(targetPath);
        const config = await response.json();

        const startCenter = mapView.getCenter();
        config.portalConfig.map.mapView.startCenter = startCenter;

        // Update baselayer elements
        config.layerConfig.baselayer.elements =
          config.layerConfig.baselayer.elements.map((layerElement) => {
            const foundLayer = layers.find(
              (layer) => layer.id === layerElement.id && layer.baselayer,
            );
            return foundLayer
              ? this.updateLayerObject(layerElement, foundLayer)
              : layerElement;
          });

        // Update subjectlayer elements
        config.layerConfig.subjectlayer.elements =
          config.layerConfig.subjectlayer.elements.map((layerElement) => {
            const foundLayer = layers.find(
              (layer) => layer.id === layerElement.id && !layer.baselayer,
            );
            return foundLayer
              ? this.updateLayerObject(layerElement, foundLayer)
              : layerElement;
          });

        this.configToExport = config;
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Prepare config for download
     * @function prepareConfigForDownload
     * @returns {Promise}
     */
    async prepareLayerForDownload() {
      // const layers = await this.allLayerConfigs;
      // console.log("[LayerDownloader] layers::", layers);

      const _layerCollection = layerCollection.getLayers();
      const projectionCode = this.$store.getters["Maps/projectionCode"];

      console.log("[LayerDownloader] _layerCollection::", _layerCollection);

      this.fileSources = []; // Reset the fileSources array

      _layerCollection.forEach((layer, index) => {
        console.log(
          "[LayerDownloader]  _layerCollection layer::",
          layer.attributes.id,
        );

        if (layer.layer instanceof VectorLayer) {
          console.log("[LayerDownloader] we have a vector layer::");

          // todo: check for Layer2dVectorGeojson

          const geoJSONData = exportLayerAsGeoJSON(layer.layer, projectionCode);
          const fileName = `${layer.attributes.id}.geojson`;

          this.fileSources.push({
            title: fileName,
            src: URL.createObjectURL(
              new Blob([geoJSONData], { type: "application/json" }),
            ),
          });
        }
      });
    },
    /**
     * updates the layerObject with the foundLayer
     * @param {Object} layerElement
     * @param {Object} foundLayer
     * @returns {Object}
     */
    updateLayerObject(layerElement, foundLayer) {
      const updatedLayerObject = { ...layerElement };

      // Iterate over the keys in foundLayer
      Object.keys(foundLayer).forEach((key) => {
        if (layerElement[key] !== foundLayer[key]) {
          updatedLayerObject[key] = foundLayer[key];
        }
      });

      // todo: clarify iterate over the keys in layerElement that are not present in foundLayer
      Object.keys(layerElement).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(foundLayer, key)) {
          updatedLayerObject[key] = layerElement[key];
        }
      });

      return updatedLayerObject;
    },
    forceFileDownload(zip, zipName) {
      zip
        .generateAsync({ type: "blob" })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${zipName}.zip`);
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.log(error));
    },
    async downloadWithFetch(files, zipName) {
      await this.prepareConfigForDownload();

      const zip = new JSZip();
      const fetchPromises = files.map(async (file) => {
        const response = await fetch(file.src);
        const buffer = await response.arrayBuffer();
        zip.file(file.title, buffer);
      });

      // create config.json
      const configJson = JSON.stringify(this.configToExport);
      zip.file("config.json", configJson);

      await Promise.all(fetchPromises);
      this.forceFileDownload(zip, sanitizeSelector(zipName));
    },
  },
};
</script>

<template lang="html">
  <div
    id="exporter-addon"
    class="ExporterAddon-root mb-3"
  >
    <div class="d-flex flex-column gap-3">
      <label
        for="projectTitle"
        class="form-label"
        >Projekt Titel</label
      >
      <input
        v-model="projectTitle"
        id="projectTitle"
        type="text"
        class="form-control"
        placeholder="Gib einen Projekttitel ein"
      />
      <button
        class="btn btn-primary"
        @click="
          downloadWithFetch(fileSources, projectTitle || 'amarex-download')
        "
      >
        Download Project ZIP
      </button>

      <button
        class="btn btn-primary"
        @click="prepareLayerForDownload()"
      >
        Prepare Layer for Download
      </button>
      <!-- <LayerDownloader /> -->
    </div>
  </div>
</template>

<style lang="scss">
.ExporterAddon-root {
  width: 100%;
  height: 100px;
}
</style>

