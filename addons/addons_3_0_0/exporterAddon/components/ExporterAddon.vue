<script>
import { mapGetters } from "vuex";
import JSZip from "jszip";
import sanitizeSelector from "../../../../src/utils/sanitizeSelector";

/**
 * ExporterAddon
 * @description Exporter Addon
 * @module addons/ExporterAddon
 */
export default {
  name: "ExporterAddon",
  data() {
    return {
      configToExport: null,
      fileSources: [],
      projectTitle: "",
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
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

      try {
        const response = await fetch(targetPath);
        const config = await response.json();

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
    </div>
  </div>
</template>

<style lang="scss">
.ExporterAddon-root {
  width: 100%;
  height: 100px;
}
</style>

