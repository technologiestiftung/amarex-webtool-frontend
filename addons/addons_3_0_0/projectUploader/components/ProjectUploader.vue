<script>
import { mapActions, mapGetters } from "vuex";
import FlatButton from "../../../../src_3_0_0/shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../../src_3_0_0/shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../../src_3_0_0/shared/modules/inputs/components/FileUpload.vue";

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
  methods: {},
};
</script>

<template lang="html">
  <div id="file-import">
    <p
      class="mb-3"
      v-html="$t('common:modules.appFileImport.captions.introInfo')"
    />
    <p
      class="mb-3"
      v-html="$t('common:modules.appFileImport.captions.introFormats')"
    />
    <FileUpload :id="'fileUpload'">
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
      <FlatButton v-if="fileUploaded" />
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

