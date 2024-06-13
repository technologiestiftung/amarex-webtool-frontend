<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import FlatButton from "../../../../src_3_0_0/shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../../src_3_0_0/shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../../src_3_0_0/shared/modules/inputs/components/FileUpload.vue";
import JSZip from "jszip";
import layerCollection from "../../../../src_3_0_0/core/layers/js/layerCollection.js";

// TODO:
// add locals

/**
 * Project Uploader
 * @module modules/ProjectUploader
 */
export default {
  name: "ProjectUploader",
  components: {
    FlatButton,
    FileUpload,
    IconButton,
  },
  data() {
    return {
      fileUploaded: false,
      filesToUpload: [],
      selectedFiles: {},
    };
  },
  computed: {
    ...mapGetters("Modules/ProjectUploader", [
      "importedFileNames",
      "enableZoomToExtend",
      "featureExtents",
      "addLayerConfig",
    ]),

    ...mapGetters(["Maps/projectionCode", "layerConfig", "portalConfig"]),
    dropZoneAdditionalClass: function () {
      return this.dzIsDropHovering ? "dzReady" : "";
    },
  },
  mounted() {
    this.setFocusToFirstControl();
    this.modifyImportedFileNames(this.importedFileNames);
    this.modifyImportedFileExtent(this.featureExtents, this.importedFileNames);
  },
  watch: {
    filesToUpload: {
      handler(newValue) {
        // console.log("Watcher Uploaded Files:", newValue);
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions("Modules/ProjectUploader", [
      "importFile",
      "importGeoJSON",
      "openDrawTool",
      "processConfigJsonOnload",
    ]),
    ...mapActions("Maps", ["zoomToExtent"]),
    ...mapActions("Alerting", ["addSingleAlert"]),
    ...mapMutations("Modules/ProjectUploader", ["setFeatureExtents"]),

    /**
     * Sets the focus to the first control
     * @returns {void}
     */
    setFocusToFirstControl() {
      this.$nextTick(() => {
        if (this.$refs["upload-label"]) {
          this.$refs["upload-label"].focus();
        }
      });
    },

    /**
     * Unzip file
     * @param {FileList} files The files
     * @returns {void}
     */
    async processFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.includes("zip")) {
          await this.processZipFile(file);
        } else {
          if (this.checkValid(file)) {
            this.filesToUpload.push(file);
            this.fileUploaded = true;
          }
        }
      }
      this.fileUploaded = true;
    },
    async processZipFile(file) {
      const zip = await JSZip.loadAsync(file);
      const filesInZip = Object.values(zip.files).filter(
        (file) => !file.dir && file.name.indexOf("__") !== 0,
      );
      for (const fileInZip of filesInZip) {
        const fileContent = await fileInZip.async("blob");
        this.filesToUpload.push(
          new File([fileContent], fileInZip.name, {
            type: fileInZip.contentType,
          }),
        );
      }
    },
    triggerClickOnFileInput(event) {
      if (event.which === 32 || event.which === 13) {
        this.$refs["upload-input-file"].click();
      }
    },
    onInputChange(event) {
      const files = event.target.files;

      if (files !== undefined) {
        this.processFiles(files);
        event.target.value = null;
      }
    },
    onDrop(event) {
      event.preventDefault();
      this.processFiles(event.dataTransfer.files);
    },
    /**
     * Checks if the file is valid
     * @param {File} file The file
     * @returns {boolean} true, if the file is valid
     */
    checkValid(file) {
      const validExtensions = [".json", ".geojson", ".kml", ".gpx"];
      if (validExtensions.some((ext) => file.name.includes(ext))) {
        return true;
      }
      this.addSingleAlert({
        category: "error",
        content: this.$t(
          "common:modules.appFileImport.alertingMessages.formatError",
          { filename: file.name },
        ),
      });
      return false;
    },

    async isValidConfigFile(file) {
      try {
        let fileContent = await file.text();
        const parsedJson = JSON.parse(fileContent);

        const isValid =
          typeof parsedJson === "object" &&
          parsedJson !== null &&
          "portalConfig" in parsedJson &&
          "layerConfig" in parsedJson;
        return isValid;
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        return false;
      }
    },

    /**
     * Finds first config file
     * @returns {File | null}
     */
    async findFirstConfigFile() {
      const validConfigFiles = await Promise.all(
        this.filesToUpload.map(async (file) => {
          const isValid = await this.isValidConfigFile(file);
          return isValid ? file : null;
        }),
      );
      return validConfigFiles.find((file) => file !== null) || null;
    },

    /**
     * Removes the file
     * @param {File} file file to remove
     * @returns {void}
     */
    removeFile(file) {
      if (this.filesToUpload.includes(file)) {
        const index = this.importedFileNames[file];

        this.filesToUpload.splice(index, 1);
        if (this.filesToUpload.length === 0) {
          this.fileUploaded = false;
        }
      }
    },

    /**
     * Adds the project
     * @returns {void}
     */
    async addProject() {
      await this.addConfig();
      await this.addFiles();
    },

    /**
     * Adds the config
     * @returns {void}
     */
    async addConfig() {
      const configFile = await this.findFirstConfigFile();

      if (configFile) {
        if (!this.checkValid(configFile)) return;
        const reader = new FileReader();

        reader.onload = (evt) => {
          this.processConfigJsonOnload(evt);
        };
        reader.readAsText(configFile);
      }
    },

    /**
     * Adds files to the project
     * @returns {Promise<void>}
     */
    async addFiles() {
      this.filesToUpload.forEach(async (file) => {
        if (!this.checkValid(file)) return;

        const isValidConfig = await this.isValidConfigFile(file);
        const reader = new FileReader();

        if (!isValidConfig) {
          const fileName = file.name.split(".")[0];
          const layer = await layerCollection.getLayerById(fileName);

          reader.onload = async (event) => {
            if (layer) {
              const raw = event.target.result;
              const importAction =
                layer.attributes.typ.toUpperCase() === "GEOJSON"
                  ? this.importGeoJSON
                  : this.importFile;

              importAction({
                raw,
                layer: layer.layer,
                filename: file.name,
              });
            }
          };
        }
        reader.readAsText(file);
        this.filesToUpload = [];
      });
    },

    /**
     * Check if there are still features from the imported file.
     * If there are no features existed from the same imported file, the file name will be removed.
     * @param {String[]} fileNames the imported file name lists
     * @returns {void}
     */
    modifyImportedFileNames(fileNames) {
      const modifiedFileNames = [];

      if (
        typeof this.layer !== "undefined" &&
        Array.isArray(fileNames) &&
        fileNames.length
      ) {
        fileNames.forEach((name) => {
          if (this.selectedFiles[name]) {
            this.layer
              .getSource()
              .getFeatures()
              .forEach((feature) => {
                if (
                  feature.get("source") &&
                  feature.get("source") === name &&
                  !modifiedFileNames.includes(name)
                ) {
                  modifiedFileNames.push(name);
                }
              });
          }
        });

        this.setImportedFileNames(modifiedFileNames);
      }
    },

    /**
     * Check if there are still features from the imported file.
     * If there are no features existed from the same imported file, the file name will be removed.
     * @param {Object} featureExtents the feature extent object, key is the file name and value is the feature extent
     * @param {String[]} fileNames the imported file name lists
     * @returns {void}
     */
    modifyImportedFileExtent(featureExtents, fileNames) {
      const modifiedFeatureExtents = {};

      fileNames.forEach((name) => {
        if (this.selectedFiles[name]) {
          modifiedFeatureExtents[name] = featureExtents[name];
        }
      });

      this.setFeatureExtents(modifiedFeatureExtents);
    },
  },
};
</script>

<template lang="html">
  <div id="file-import">
    <p
      class="mb-3"
      v-html="$t('Project Uploader')"
    />
    <p
      class="mb-3"
      v-html="$t('Formats')"
    />
    <FileUpload
      :id="'fileUpload'"
      :keydown="(e) => triggerClickOnFileInput(e)"
      :change="(e) => onInputChange(e)"
      :drop="(e) => onDrop(e)"
    >
      <div v-if="fileUploaded">
        <div
          v-for="file in filesToUpload"
          :key="file"
          :class="enableZoomToExtend ? 'hasZoom' : ''"
          class="row d-flex mb-1"
        >
          <span class="d-flex align-items-center col">
            {{ file.name }}
          </span>
          <IconButton
            :aria="$t('common:modules.appFileImport.removeAttachment')"
            :icon="'bi-trash'"
            :interaction="() => removeFile(file)"
            class="remove-btn col-3"
          />
        </div>
      </div>
    </FileUpload>

    <div class="d-flex justify-content-center">
      <FlatButton
        v-if="fileUploaded"
        :aria-label="$t('common:modules.appFileImport.importFiles')"
        :interaction="() => addProject()"
        :text="$t('common:modules.appFileImport.importFiles')"
        :icon="'bi-upload'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.h-seperator {
  margin: 12px 0 12px 0;
  border: 1px solid #dddddd;
}

.remove-btn {
  z-index: 20;
  position: relative;
}

input[type="file"] {
  display: none;
}
input[type="button"] {
  display: none;
}

.introDrawTool {
  font-style: italic;
}

li {
  &.hasZoom {
    display: inline-block;
    width: 100%;
    &:not(:last-child) {
      margin-bottom: 5px;
    }
    span {
      &:first-child {
        display: inline-block;
        margin-top: 5px;
        width: calc(100% - 80px);
      }
      &:last-child {
        display: inline-block;
        margin-top: 0;
      }
    }
  }
}
</style>

