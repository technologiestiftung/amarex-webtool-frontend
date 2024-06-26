<script>
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
/**
 * Routing Batch Processing
 * @module modules/RoutingBatchProcessing
 * @vue-prop {Object} settings - The settings for the element.
 * @vue-prop {Number} progress - The progress for the progress bar.
 * @vue-prop {Boolean} isProcessing - Shows if processing is active.
 * @vue-prop {String} structureText - The structure text.
 * @vue-prop {String} exampleText - The example text.
 *
 * @vue-data {Boolean} dzIsDropHovering - Shows if hovering over the dropzone is active.
 *
 * @vue-computed {String} dropZoneAdditionalClass - The additional class for the drop zone.
 *
 * @vue-event {String} cancelProcess - Emits function to cancel the process.
 * @vue-event {File[]} filesadded - Emits function to add files.
 */
export default {
  name: "RoutingBatchProcessing",
  components: { IconButton },
  props: {
    settings: {
      type: Object,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    isProcessing: {
      type: Boolean,
      required: true,
    },
    structureText: {
      type: String,
      required: true,
    },
    exampleText: {
      type: String,
      required: true,
    },
  },
  emits: ["cancelProcess", "filesadded"],
  data() {
    return {
      dzIsDropHovering: false,
    };
  },
  computed: {
    /**
     * Gets the class for the file drop element
     * @returns {String} class to display
     */
    dropZoneAdditionalClass: function () {
      return this.dzIsDropHovering ? "dzReady" : "";
    },
  },
  watch: {
    /**
     * Resets the HTML File input after it has been read
     * @param {Boolean} newVal isProcessing
     * @returns {void}
     */
    isProcessing: function (newVal) {
      if (newVal) {
        this.$refs.fileInput.value = "";
      }
    },
  },
  methods: {
    /**
     * Called when user uploads a file to process
     * @param {HTMLInputEvent} e event with the files
     * @returns {void}
     */
    onInputChange(e) {
      if (e.target.files !== undefined) {
        this.addFiles(e.target.files);
      }
    },
    /**
     * Called internally to emit the files to process
     * @param {File[]} files to emit
     * @returns {void}
     */
    addFiles(files) {
      this.$emit("filesadded", files);
    },
    /**
     * Called to open the file select dialog in the browser
     * @returns {void}
     */
    startFileInput() {
      this.$refs.fileInputLabel.click();
    },
    /**
     * Called when user starts dragging a file over the upload container
     * @returns {void}
     */
    onDZDragenter() {
      this.dzIsDropHovering = true;
    },
    /**
     * Called when user stops dragging a file over the upload container
     * @returns {void}
     */
    onDZDragend() {
      this.dzIsDropHovering = false;
    },
    /**
     * Called when user drops a file in the upload container
     * @param {HTMLInputEvent} e event with the files
     * @returns {void}
     */
    onDrop(e) {
      this.dzIsDropHovering = false;
      if (e.dataTransfer.files !== undefined) {
        this.addFiles(e.dataTransfer.files);
      }
    },
  },
};
</script>

<template>
  <div id="routing-batch-processing">
    <div
      v-if="isProcessing"
      id="routing-batch-processing-isprocessing"
      class="d-flex flex-column"
    >
      <span>{{
        $t("common:modules.routing.batchProcessing.isProcessing")
      }}</span>
      <div class="d-flex">
        <progress
          class="col-8"
          max="100"
          :value="progress"
        />
        <span
          id="routing-batch-processing-isprocessing-progresstext"
          class="col-3"
          >{{ progress }} %</span
        >
        <IconButton
          :aria="$t('common:modules.routing.batchProcessing.cancel')"
          :class-array="['btn-light']"
          :icon="'bi-x'"
          :interaction="() => $emit('cancelProcess')"
        />
      </div>
    </div>

    <div
      v-else
      class="d-flex flex-column"
    >
      <div class="strukturtext d-flex flex-column bg-light-pink mb-2">
        <div class="d-flex flex-column">
          <span
            >{{ $t("common:modules.routing.batchProcessing.structure") }}:</span
          >
          <b>{{ structureText }}</b>
        </div>
        <div class="d-flex mb-2">
          <span
            >{{ $t("common:modules.routing.batchProcessing.example") }}:</span
          >
          <span>{{ exampleText }}</span>
        </div>
      </div>

      <div
        class="vh-center-outer-wrapper drop-area-fake mb-2"
        :class="dropZoneAdditionalClass"
      >
        <div class="vh-center-inner-wrapper">
          <p class="caption">
            {{ $t("common:modules.routing.batchProcessing.placeFile") }}
          </p>
        </div>

        <div
          class="drop-area"
          role="presentation"
          @drop.prevent="onDrop($event)"
          @dragover.prevent
          @dragenter.prevent="onDZDragenter()"
          @dragleave="onDZDragend()"
        />
      </div>

      <button
        class="btn"
        type="button flex-grow-1"
        @click="startFileInput()"
      >
        {{ $t("common:modules.routing.batchProcessing.uploadFile") }}
      </button>
    </div>

    <label
      ref="fileInputLabel"
      class="d-none"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        @change="onInputChange($event)"
      />
    </label>
  </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.bg-light-pink {
  background: #e8c9c9;
}

.drop-area-fake {
  background-color: $white;
  border-radius: 12px;
  border: 2px dashed $accent_disabled;
  padding: 24px;
  transition:
    background 0.25s,
    border-color 0.25s;
  &.dzReady {
    background-color: $accent_hover;
    border-color: transparent;
    p.caption {
      color: $white;
    }
  }
  p.caption {
    margin: 0;
    text-align: center;
    transition: color 0.35s;
    font-family: $font_family_accent;
    font-size: $font-size-lg;
    color: $accent_disabled;
  }
}
.drop-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}
.vh-center-outer-wrapper {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  position: relative;
  &:before {
    content: "";
    display: inline-block;
    height: 100%;
    vertical-align: middle;
    margin-right: -0.25rem;
  }
}
.vh-center-inner-wrapper {
  text-align: left;
  display: inline-block;
  vertical-align: middle;
  position: relative;
}

.strukturtext {
  max-width: 350px;
}
</style>
