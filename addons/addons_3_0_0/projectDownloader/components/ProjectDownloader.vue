<script>
import { mapGetters } from "vuex";
import JSZip from "jszip";
import sanitizeSelector from "../../../../src/utils/sanitizeSelector";
import { exportLayerAsGeoJSON } from "../utils/download";
import layerCollection from "../../../../src_3_0_0/core/layers/js/layerCollection";
import mapCollection from "../../../../src_3_0_0/core/maps/js/mapCollection";
import VectorLayer from "ol/layer/Vector";

/**
 * ProjectDownloader
 * @description Project Downloader
 * @module addons/ProjectDownloader
 */
export default {
  name: "ProjectDownloader",
  data() {
    return {
      configToExport: null,
      fileSources: [],
      projectTitle: "",
    };
  },
  computed: {
    ...mapGetters([
      "allLayerConfigs",
      "Maps/projectionCode",
      "layerConfig",
      "portalConfig",
    ]),
  },
  methods: {
    /**
     * Prepare config for download
     * @function prepareConfigForDownload
     * @returns {Promise}
     */
    async prepareConfigForDownload() {
      const layerConfig = this.layerConfig;
      const portalConfig = this.portalConfig;
      const mapView = await mapCollection.getMapView("2D");

      try {
        portalConfig.map.mapView.startZoomLevel = mapView.getZoom();
        portalConfig.map.mapView.startCenter = mapView.getCenter();

        // Filter layers with showInLayerTree: true
        const filteredBaselayer = {
          elements: layerConfig.baselayer.elements.filter(
            (layer) => layer.showInLayerTree === true,
          ),
        };
        const filteredSubjectlayer = {
          elements: layerConfig.subjectlayer.elements.filter(
            (layer) => layer.showInLayerTree === true,
          ),
        };

        const filteredLayerConfig = {
          baselayer: filteredBaselayer,
          subjectlayer: filteredSubjectlayer,
        };

        this.configToExport = {
          portalConfig,
          layerConfig: filteredLayerConfig,
        };
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Prepare VectorLayer for download
     * @function prepareVectorLayerForDownload
     * @returns {Promise}
     */
    async prepareVectorLayerForDownload() {
      const layerCollectionData = layerCollection.getLayers();
      const projectionCode = this.$store.getters["Maps/projectionCode"];
      this.fileSources = []; // Reset the fileSources array

      try {
        layerCollectionData.forEach((layer) => {
          if (!layer.attributes.showInLayerTree) return;

          if (
            layer.layer instanceof VectorLayer &&
            (layer.attributes.typ !== "WFS" || "WMS")
          ) {
            const geoJSONData = exportLayerAsGeoJSON(
              layer.layer,
              projectionCode,
            );

            if (geoJSONData) {
              this.fileSources.push({
                title: `${layer.attributes.id}.geojson`,
                src: URL.createObjectURL(
                  new Blob([geoJSONData], { type: "application/json" }),
                ),
              });
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
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
    async downloadWithFetch(zipName) {
      await this.prepareConfigForDownload();
      await this.prepareVectorLayerForDownload();
      const zip = new JSZip();

      // Create config.json
      const configJson = JSON.stringify(this.configToExport);
      zip.file("config.json", configJson);

      const fetchPromises = this.fileSources.map(async (file) => {
        const response = await fetch(file.src);
        const buffer = await response.arrayBuffer();
        zip.file(file.title, buffer);
      });

      await Promise.all(fetchPromises);
      this.forceFileDownload(zip, sanitizeSelector(zipName));
    },
  },
};
</script>

// todo: add locals
<template lang="html">
  <div
    id="exporter-addon"
    class="ProjectDownloader-root mb-3"
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
        @click="downloadWithFetch(projectTitle || 'amarex-download')"
      >
        Download Project ZIP
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.ProjectDownloader-root {
  width: 100%;
  height: 100px;
}
</style>

