<script>
import { mapActions, mapGetters } from "vuex";
import FlatButton from "../../../../src_3_0_0/shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../../src_3_0_0/shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../../src_3_0_0/shared/modules/inputs/components/FileUpload.vue";
import JSZip from "jszip";

// todo: create function to upload all files
// upload config first
// then upload all files

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
      uploadedFiles: [],
      selectedFiles: {},
    };
  },
  computed: {},
  mounted() {},
  watch: {
    uploadedFiles: {
      handler(newValue) {
        console.log("Uploaded Files:", newValue);
      },
      deep: true,
    },
  },
  methods: {
    async processFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.includes("zip")) {
          await this.processZipFile(file);
        } else if (file.type.includes("directory")) {
          await this.processDirectory(file);
        } else {
          this.uploadedFiles.push(file);
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
        this.uploadedFiles.push(
          new File([fileContent], fileInZip.name, {
            type: fileInZip.contentType,
          }),
        );
      }
    },
    async processDirectory(directory) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(directory);
      reader.onload = async () => {
        const zip = await JSZip.loadAsync(reader.result);
        const filesInDirectory = Object.values(zip.files).filter(
          (file) => !file.dir && file.name.indexOf("__") !== 0,
        );
        for (const fileInDirectory of filesInDirectory) {
          const fileContent = await fileInDirectory.async("blob");
          this.uploadedFiles.push(
            new File([fileContent], fileInDirectory.name, {
              type: fileInDirectory.contentType,
            }),
          );
        }
      };
    },

    // NOTE: Events
    triggerClickOnFileInput(event) {
      if (event.which === 32 || event.which === 13) {
        this.$refs["upload-input-file"].click();
      }
    },
    onInputChange(event) {
      const files = event.target.files;
      this.processFiles(files);
    },
    onDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      this.processFiles(files);
    },

    // NOTE: Remove
    removeFile(file) {
      if (this.uploadedFiles.includes(file)) {
        const index = this.importedFileNames[file];

        this.uploadedFiles.splice(index, 1);
        if (this.uploadedFiles.length === 0) {
          this.fileUploaded = false;
        }
      }
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
          v-for="file in uploadedFiles"
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
            class="remove-btn col-3"
          />
        </div>
      </div>
    </FileUpload>

    <div class="d-flex justify-content-center">
      <FlatButton
        v-if="fileUploaded"
        text="Submit"
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

