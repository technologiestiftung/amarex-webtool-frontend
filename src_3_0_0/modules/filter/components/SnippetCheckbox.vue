<script>
import { translateKeyWithPlausibilityCheck } from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import { getDefaultOperatorBySnippetType } from "../utils/getDefaultOperatorBySnippetType.js";
import SnippetInfo from "./SnippetInfo.vue";

/**
 * Snippet Checkbox
 * @module modules/SnippetCheckbox
 * @vue-prop {String} attrName - The attribute's name.
 * @vue-prop {Array} adjustment - A list of adjustments.
 * @vue-prop {Boolean} disabled - Shows if the checkbox is disabled.
 * @vue-prop {Array} info - The snippet info.
 * @vue-prop {Array} title - The snippet title.
 */
export default {
  name: "SnippetCheckbox",
  components: {
    SnippetInfo,
  },
  props: {
    attrName: {
      type: [String, Array],
      required: false,
      default: "",
    },
    adjustment: {
      type: [Object, Boolean],
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    info: {
      type: [String, Boolean],
      required: false,
      default: false,
    },
    title: {
      type: [String, Boolean],
      required: false,
      default: true,
    },
    operatorForAttrName: {
      type: String,
      required: false,
      default: "AND",
    },
    operator: {
      type: String,
      required: false,
      default: undefined,
    },
    prechecked: {
      type: Boolean,
      required: false,
      default: false,
    },
    snippetId: {
      type: Number,
      required: false,
      default: 0,
    },
    value: {
      type: Array,
      required: false,
      default() {
        return [true, false];
      },
    },
    visible: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: ["changeRule", "deleteRule", "setSnippetPrechecked"],
  data() {
    return {
      isInitializing: true,
      checked: false,
      translationKey: "snippetCheckbox",
      operatorWhitelist: ["EQ"],
    };
  },
  computed: {
    ariaLabelCheckbox() {
      return this.$t("common:modules.filter.ariaLabel.checkbox", {
        param: this.attrName,
      });
    },
    titleText() {
      if (this.title === true) {
        return this.attrName;
      } else if (typeof this.title === "string") {
        return this.translateKeyWithPlausibilityCheck(this.title, (key) =>
          this.$t(key),
        );
      }
      return "";
    },
    securedOperator() {
      if (!this.operatorWhitelist.includes(this.operator)) {
        return getDefaultOperatorBySnippetType("checkbox");
      }
      return this.operator;
    },
  },
  watch: {
    checked: {
      handler(checked) {
        const value =
          this.value.length >= 2 ? this.value[Number(!checked)] : checked;

        this.emitCurrentRule(value, this.isInitializing);
      },
    },
  },
  created() {
    if (this.prechecked) {
      this.checked = this.prechecked;
    }
    this.$nextTick(() => {
      this.isInitializing = false;
    });
    if (this.visible && this.prechecked) {
      this.emitCurrentRule(this.prechecked, true);
    }
  },
  mounted() {
    this.$emit(
      "setSnippetPrechecked",
      this.visible && this.prechecked ? this.snippetId : false,
    );
  },
  methods: {
    translateKeyWithPlausibilityCheck,

    /**
     * Emits the current rule to whoever is listening.
     * @param {*} value the value to put into the rule
     * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
     * @returns {void}
     */
    emitCurrentRule(value, startup = false) {
      if (value === true || value !== this.value[1]) {
        this.$emit("changeRule", {
          snippetId: this.snippetId,
          startup,
          fixed: !this.visible,
          attrName: this.attrName,
          operatorForAttrName: this.operatorForAttrName,
          operator: this.securedOperator,
          value,
          tagTitle: this.titleText,
        });
      } else {
        this.deleteCurrentRule();
      }
    },
    /**
     * Emits the delete rule function to whoever is listening.
     * @returns {void}
     */
    deleteCurrentRule() {
      this.$emit("deleteRule", this.snippetId);
    },
    /**
     * Resets the values of this snippet.
     * @param {Function} onsuccess the function to call on success
     * @returns {void}
     */
    resetSnippet(onsuccess) {
      if (this.visible) {
        this.checked = false;
      }
      this.$nextTick(() => {
        if (typeof onsuccess === "function") {
          onsuccess();
        }
      });
    },
  },
};
</script>

<template>
  <div
    v-show="visible"
    class="snippetCheckboxContainer"
  >
    <div class="left">
      <input
        :id="'snippetCheckbox-' + snippetId"
        v-model="checked"
        :aria-label="ariaLabelCheckbox"
        class="snippetCheckbox"
        type="checkbox"
        name="checkbox"
        :disabled="disabled"
      />
      <label
        v-if="title !== false"
        :for="'snippetCheckbox-' + snippetId"
        class="snippetCheckboxLabel"
        >{{ titleText }}</label
      >
    </div>
    <div
      v-if="info"
      class="right"
    >
      <SnippetInfo
        :info="info"
        :translation-key="translationKey"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~mixins";
@import "~variables";
.snippetCheckboxContainer {
  height: auto;
}
.snippetCheckboxContainer .info-icon {
  float: right;
  font-size: $font_size_icon_lg;
  color: $light_grey;
}
.snippetCheckboxContainer .info-icon .opened {
  color: $black;
}
.snippetCheckboxContainer .info-icon:hover {
  cursor: pointer;
  color: $light_grey;
}
.snippetCheckboxContainer .info-text {
  border: 1px solid $light_grey;
  border-radius: 5px;
  font-size: $font-size-sm;
  padding: 15px 10px;
}
.snippetCheckboxContainer .bottom {
  clear: left;
  width: 100%;
}
.snippetCheckboxContainer .left {
  input[type="radio"],
  input[type="checkbox"] {
    margin: 0 5px 0 0;
  }
  /*float: left;*/
  input {
    float: left;
    width: 15px;
    margin-right: 5px;
  }
  label {
    float: left;
    /*margin-bottom: 0;*/
    cursor: pointer;
  }
}
.snippetCheckboxContainer .right {
  position: absolute;
  right: 0;
}
</style>
