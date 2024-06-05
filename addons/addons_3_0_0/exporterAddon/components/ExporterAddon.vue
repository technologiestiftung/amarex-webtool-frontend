<script>
import { mapGetters } from "vuex";
import JSZip from "jszip";
import sanitizeSelector from "../../../../src/utils/sanitizeSelector";
import { exportLayerAsGeoJSON, exportLayerAsKML } from "../utils/download";
import layerCollection from "../../../../src_3_0_0/core/layers/js/layerCollection";
import mapCollection from "../../../../src_3_0_0/core/maps/js/mapCollection";
import VectorLayer from "ol/layer/Vector";

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
      const mapView = await mapCollection.getMapView("2D");

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

        // Add all WMS and WFS layers that are not from the original config to subjectlayer elements
        const missingWMSandWFSLayers = layers.filter((layer) => {
          const isWMSorWFS = layer.typ === "WMS" || layer.typ === "WFS";
          const isNotInConfig = !config.layerConfig.subjectlayer.elements.some(
            (layerElement) => layerElement.id === layer.id,
          );
          return isWMSorWFS && isNotInConfig;
        });

        missingWMSandWFSLayers.forEach((layer) => {
          const newLayerObject = { ...layer };
          config.layerConfig.subjectlayer.elements.push(newLayerObject);
        });

        this.configToExport = config;
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
      const _layerCollection = layerCollection.getLayers();
      const projectionCode = this.$store.getters["Maps/projectionCode"];
      this.fileSources = []; // Reset the fileSources array

      // todo: clarify check if layer is visible
      try {
        _layerCollection.forEach((layer) => {
          if (
            layer.layer instanceof VectorLayer &&
            // layer.attributes.visibility === true &&
            (layer.attributes.typ === "GeoJSON" ||
              layer.attributes.typ === "GEOJSON") &&
            !this.configToExport.layerConfig.subjectlayer.elements.some(
              (layerElement) => layerElement.id === layer.attributes.id,
            )
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
          } else if (layer.layer instanceof VectorLayer) {
            const KMLData = exportLayerAsKML(layer.layer, projectionCode);
            if (KMLData) {
              this.fileSources.push({
                title: `${layer.attributes.id}.kml`,
                src: URL.createObjectURL(
                  new Blob([KMLData], { type: "application/vnd.google-earth.kmz" }),
                ),
              });
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    /**
     * Updates the layerObject with the foundLayer
     * @param {Object} layerElement
     * @param {Object} foundLayer
     * @returns {Object}
     */
    updateLayerObject(layerElement, foundLayer) {
      const updatedLayerObject = { ...layerElement };

      // Update keys in layerElement with values from foundLayer
      Object.keys(foundLayer).forEach((key) => {
        if (layerElement[key] !== foundLayer[key]) {
          updatedLayerObject[key] = foundLayer[key];
        }
      });

      // Add keys in layerElement that are not present in foundLayer
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
        @click="downloadWithFetch(projectTitle || 'amarex-download')"
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

