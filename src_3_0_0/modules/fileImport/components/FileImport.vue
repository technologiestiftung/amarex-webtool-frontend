<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import isObject from "../../../shared/js/utils/isObject";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../shared/modules/inputs/components/FileUpload.vue";

/**
 * File Import
 * @module modules/FileImport
 * @vue-data {Boolean} fileUploaded - Shows if a file was uploaded.
 * @vue-data {Array} uploadedFiles - List of importet files.
 * @vue-computed {String} dropZoneAdditionalClass - Class for the dropzone.
 */
export default {
    name: "FileImport",
    components: {
        FlatButton,
        FileUpload,
        IconButton
    },
    data () {
        return {
            fileUploaded: false,
            uploadedFiles: []
        };
    },
    computed: {
        ...mapGetters("Modules/FileImport", ["importedFileNames", "enableZoomToExtend", "featureExtents"]),

        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    mounted () {
        this.setFocusToFirstControl();
        this.modifyImportedFileNames(this.importedFileNames);
        this.modifyImportedFileExtent(this.featureExtents, this.importedFileNames);
    },
    methods: {
        ...mapActions("Modules/FileImport", [
            "addLayerConfig",
            "importFile",
            "importGeoJSON",
            "openDrawTool"
        ]),
        ...mapActions("Maps", ["zoomToExtent"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapMutations("Modules/FileImport", ["setFeatureExtents"]),

        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["upload-label"]) {
                    this.$refs["upload-label"].focus();
                }
            });
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                Array.from(e.target.files).forEach(file => {
                    if (this.checkValid(file)) {
                        this.uploadedFiles.push(file);
                        this.fileUploaded = true;
                    }
                });
                e.target.value = null;
            }
        },
        onDrop (e) {
            if (e.dataTransfer.files !== undefined) {
                Array.from(e.dataTransfer.files).forEach(file => {
                    if (this.checkValid(file)) {
                        this.uploadedFiles.push(file);
                        this.fileUploaded = true;
                    }
                });
            }
        },
        checkValid (file) {
            if (file.name.includes(".json") || file.name.includes(".geojson") || file.name.includes(".kml") || file.name.includes(".gpx")) {
                return true;
            }
            this.addSingleAlert({
                category: "error",
                content: this.$t("common:modules.fileImport.alertingMessages.formatError", {filename: file.name})
            });
            return false;
        },
        addFile () {
            this.uploadedFiles.forEach(file => {
                if (this.importedFileNames.includes(file)) {
                    return;
                }
                const reader = new FileReader();

                reader.onload = async f => {
                    this.addLayerConfig()
                        .then(layer => {
                            if (layer) {
                                const fileNameSplit = file.name.split("."),
                                    fileExtension = fileNameSplit.length > 0 ? fileNameSplit[fileNameSplit.length - 1].toLowerCase() : "";

                                if (fileExtension === "geojson" || fileExtension === "json") {
                                    this.importGeoJSON({raw: f.target.result, layer: layer.layer, filename: file.name});
                                }
                                else {
                                    this.importFile({raw: f.target.result, layer: layer.layer, filename: file.name});
                                }
                            }
                        });
                };

                reader.readAsText(file);
            });
        },
        removeFile (file) {
            if (this.uploadedFiles.includes(file)) {
                const index = this.importedFileNames[file];

                this.uploadedFiles.splice(index, 1);
                if (this.uploadedFiles.length === 0) {
                    this.fileUploaded = false;
                }
            }
        },
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        /**
         * Zoom to the feature of imported file
         * @param {String} fileName the file name
         * @returns {void}
         */
        zoomTo (fileName) {
            if (!isObject(this.featureExtents) || !Object.prototype.hasOwnProperty.call(this.featureExtents, fileName)) {
                return;
            }

            this.zoomToExtent({extent: this.featureExtents[fileName]});
        },
        /**
         * Check if there are still features from the imported file.
         * If there are no features existed from the same imported file, the file name will be removed.
         * @param {String[]} fileNames the imported file name lists
         * @returns {void}
         */
        modifyImportedFileNames (fileNames) {
            const modifiedFileNames = [];

            if (typeof this.layer !== "undefined" && Array.isArray(fileNames) && fileNames.length) {
                fileNames.forEach(name => {
                    this.layer.getSource().getFeatures().forEach(feature => {
                        if (feature.get("source") && feature.get("source") === name && !modifiedFileNames.includes(name)) {
                            modifiedFileNames.push(name);
                        }
                    });
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
        modifyImportedFileExtent (featureExtents, fileNames) {
            const modifiedFeatureExtents = {};

            fileNames.forEach(name => {
                modifiedFeatureExtents[name] = featureExtents[name];
            });

            this.setFeatureExtents(modifiedFeatureExtents);
        }
    }
};
</script>

<template lang="html">
    <div
        id="file-import"
    >
        <p
            class="mb-3"
            v-html="$t('common:modules.fileImport.captions.introInfo')"
        />
        <p
            class="mb-3"
            v-html="$t('common:modules.fileImport.captions.introFormats')"
        />
        <FileUpload
            :id="'fileUpload'"
            :keydown="(e) => triggerClickOnFileInput(e)"
            :change="(e) => onInputChange(e)"
            :drop="(e) => onDrop(e)"
        >
            <div v-if="fileUploaded">
                <div
                    v-for="file in uploadedFiles"
                    :key="file"
                    :class="enableZoomToExtend ? 'hasZoom' : ''"
                    class="row d-flex mb-1"
                >
                    <span class="d-flex align-items-center col">
                        {{ file.name }}
                    </span>
                    <IconButton
                        :aria="$t('common:modules.fileImport.removeAttachment')"
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
                :aria-label="$t('common:modules.fileImport.importFiles')"
                :interaction="() => addFile()"
                :text="$t('common:modules.fileImport.importFiles')"
                :icon="'bi-upload'"
            />
        </div>

        <div v-if="importedFileNames.length > 0">
            <div class="h-seperator" />
            <p class="mb-3">
                <label
                    class="successfullyImportedLabel"
                    for="succesfully-imported-files"
                >
                    {{ $t("common:modules.fileImport.successfullyImportedLabel") }}
                </label>
                <ul id="succesfully-imported-files">
                    <li
                        v-for="(filename, index) in importedFileNames"
                        :key="index"
                        :class="enableZoomToExtend ? 'hasZoom' : ''"
                    >
                        <span>
                            {{ filename }}
                        </span>
                        <FlatButton
                            v-if="enableZoomToExtend"
                            :aria-label="$t(`common:modules.fileImport.fileZoom`, {filename: filename})"
                            :interaction="() => zoomTo(filename)"
                            :text="$t('common:modules.fileImport.zoom')"
                            :icon="'bi-rocket-takeoff-fill'"
                        />
                    </li>
                </ul>
            </p>
            <div class="h-seperator" />
            <p
                class="mb-3 introDrawTool"
                v-html="$t('common:modules.fileImport.captions.introDrawTool')"
            />
            <div
                class="d-flex justify-content-center"
            >
                <FlatButton
                    aria-label="$t('common:modules.fileImport.captions.drawTool')"
                    :interaction="openDrawTool"
                    :text="$t('common:modules.fileImport.captions.drawTool')"
                    :icon="'bi-pencil-fill'"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
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
