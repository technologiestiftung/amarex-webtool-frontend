<script>
import escapeId from "../../../shared/js/utils/escapeId";
import {mapActions} from "vuex";

/**
 * A Checkbox to select all layers at one time.
 * @module modules/SelectAllCheckBox
 * @vue-prop {Array} confs - The current layer configurations controlled by this checkbox.
 * @vue-data {Boolean} checked - Shows if checkbox is checked.
 */
export default {
    name: "SelectAllCheckBox",
    /** current layer configurations controlled by this checkbox */
    props: {
        confs: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            checked: false
        };
    },
    methods: {
        ...mapActions("Modules/LayerSelection", ["changeVisibility"]),

        /**
         * Listener for click on select all checkbox.
         * @returns {void}
         */
        clicked () {
            this.checked = !this.checked;
            this.confs.forEach(conf => {
                this.changeVisibility({layerId: conf.id, value: this.checked});
            });

        },
        /**
         * Returns true, if all layer configs are visible.
         * @returns {Boolean} true,  if all layer configs are visible
         */
        isChecked () {
            this.checked = this.confs.every((conf) => conf.visibility === true);
            return this.checked;
        },
        /**
         * Returns the ids of the ids all layer configs as String.
         * @returns {String} of the ids all layer configs
         */
        ids () {
            return this.confs.map(conf => escapeId(conf.id)).join("-");
        },
        /**
         * Returns label text for add all layers or remove all layers.
         * @returns {String} the label text
         */
        getLabelText () {
            if (this.isChecked()) {
                return i18next.t("common:modules.layerSelection.deselectAll");
            }
            return i18next.t("common:modules.layerSelection.selectAll");
        }
    }
};
</script>

<template lang="html">
    <button
        :id="'select-all-layers-' + ids()"
        class="btn d-flex w-100 layer-tree-select-all mt-3 pe-2 p-1 btn-light"
        @click="clicked()"
        @keydown.enter="clicked()"
    >
        <span
            :id="'select-all-checkbox-' + ids()"
            :class="[
                'ps-1 pe-3',
                {
                    'bi-check-square': isChecked(),
                    'bi-square': !isChecked()
                }
            ]"
        />
        <span
            class="layer-tree-layer-label mt-0 d-flex flex-column align-self-start"
            :for="'select-all-checkbox-' + ids()"
            tabindex="0"
            :aria-label="getLabelText()"
        >
            {{ getLabelText() }}
        </span>
    </button>
</template>

<style lang="scss" scoped>
    @import "~variables";
    @import "~mixins";
    .layer-tree-select-all {
        border-radius: 15px;
        &:hover {
            @include primary_action_hover;
        }
        &:focus {
            @include primary_action_focus;
        }
        margin-left: 0.7rem;
    }
    .layer-tree-layer-label {
        cursor: pointer;
    }

</style>
