<script>
import {mapActions, mapGetters} from "vuex";

/**
 * Draw Download Item
 * @module modules/DownloadItem
 */
export default {
    name: "DownloadItem",
    computed: {
        ...mapGetters("Modules/Draw_old", [
            "dataString",
            "features",
            "file",
            "fileName",
            "fileUrl",
            "download",
            "formats",
            "selectedFeature",
            "preSelectedFormat",
            "selectedFormat",
            "disableFileDownload"
        ])
    },
    mounted () {
        this.setDownloadSelectedFormat(this.download.preSelectedFormat);
        this.setDownloadFeatures();
    },
    methods: {
        ...mapActions("Modules/Draw_old", [
            "setDownloadSelectedFormat",
            "setDownloadFeatures",
            "setDownloadFileName",
            "fileDownloaded",
            "validateFileName"
        ])
    }
};
</script>

<template>
    <div>
        <hr>
        <p class="bold">
            {{ $t("common:modules.draw_old.button.download") }}
        </p>
        <form
            id="tool-draw-download"
            class="form-horizontal"
            role="form"
            @submit.prevent
        >
            <div class="form-group form-group-sm row">
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-download-format"
                >
                    {{ $t("common:modules.draw_old.download.format") }}
                </label>
                <div class="col-md-7">
                    <select
                        id="tool-draw-download-format"
                        class="form-select form-select-sm"
                        @change="setDownloadSelectedFormat($event.target.value)"
                    >
                        <option value="none">
                            {{ $t("common:modules.draw_old.download.pleaseChoose") }}
                        </option>
                        <option
                            v-for="format in download.formats"
                            :key="'tool-draw-download-format-' + format"
                            :value="format"
                            :selected="format === download.preSelectedFormat"
                        >
                            {{ format }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <label
                    class="col-md-5 col-form-label"
                    for="tool-draw-download-filename"
                >
                    {{ $t("common:modules.draw_old.download.filename") }}
                </label>
                <div class="col-md-7">
                    <input
                        id="tool-draw-download-filename"
                        type="text"
                        class="form-control form-control-sm"
                        :placeholder="$t('common:modules.draw_old.download.enterFilename')"
                        @keyup="setDownloadFileName"
                    >
                </div>
            </div>
            <div class="form-group form-group-sm row">
                <div class="d-grid gap-2">
                    <a
                        class="btn btn-sm btn-primary downloadFile"
                        :href="download.fileUrl"
                        :download="download.file"
                        :class="{disabled: disableFileDownload}"
                        role="button"
                        @click="fileDownloaded"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-save-fill" />
                        </span>
                        {{ $t("common:modules.draw_old.button.saveDrawing") }}
                    </a>
                </div>
            </div>
        </form>
    </div>
</template>
