<script>
import { mapGetters } from "vuex";
import JSZip from "jszip";

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
    };
  },
  computed: {
    ...mapGetters(["allLayerConfigs"]),
  },
  methods: {
    async prepareConfigForDownload() {
      const layers = await this.allLayerConfigs;
      const layerConfig = {
        baselayer: { elements: [] },
        subjectlayer: { elements: [] },
      };

      layers.forEach((layer) => {
        const layerData = {
          id: layer.id,
          visibility: layer.visibility,
        };

        if (layer.baselayer) {
          layerConfig.baselayer.elements.push(layerData);
        } else {
          layerConfig.subjectlayer.elements.push(layerData);
        }
      });

      this.configToExport = { layerConfig };
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
        .catch(() => console.log("error occured"));
    },
    async downloadWithFetch(files, zipName) {
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
      this.forceFileDownload(zip, zipName);
    },
  },
};
</script>

<template lang="html">
  <div
    id="exporter-addon"
    class="ExporterAddon-root"
  >
    Exporter Addon

    <div class="d-flex flex-column gap-3">
      <button @click="prepareConfigForDownload()">
        Get Config to Download
      </button>

      <button @click="downloadWithFetch(fileSources, 'amarex-download')">
        Download ZIP
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

