<script>
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import {mapActions} from "vuex";

/**
 * Filter List
 * @module modules/FilterList
 * @vue-prop {Boolean} multidLayerSelector - Shows if multi layer selection is allowed.
 * @vue-prop {Array} filters - List of all the filters.
 * @vue-prop {Array} selectedLayers - List of all the selected layers.
 * @vue-prop {Number} jumpToId - The id it should scroll to.
 * @vue-data {Array} itemRefs - The references to the item.
 * @vue-computed {Booleand} disabled - Shows if button should be disabled.
 * @vue-event {String} selectedAccordions - Updates the selected accordions.
 * @vue-event {String} setLayerLoaded - Emitting the function by transfering the filter Id of layer.
 * @vue-event {null} resetJumpToId - Resets the function.
 */
export default {
    name: "FilterList",
    components: {
    },
    props: {
        multiLayerSelector: {
            type: Boolean,
            required: false,
            default: true
        },
        filters: {
            type: Array,
            required: false,
            default: () => []
        },
        selectedLayers: {
            type: Array,
            required: false,
            default: () => []
        },
        jumpToId: {
            type: Number,
            required: false,
            default: undefined
        }
    },
    emits: ["selectedAccordions", "setLayerLoaded", "resetJumpToId"],
    data () {
        return {
            itemRefs: []
        };
    },
    computed: {
        /**
         * Checks if Selector should be disabled.
         * @param {Number} filterId id to check if should be disabled
         * @returns {Boolean} if button should be disabled
         */
        disabled (filterId) {
            return !this.multiLayerSelector && this.selectedLayers.length > 0 && this.selectedLayers.some(accordion => accordion.filterId === filterId);
        }
    },
    watch: {
        jumpToId (newFilterId) {
            this.scrollToView(newFilterId);
        }
    },
    mounted () {
        this.scrollToView(this.jumpToId);
    },
    methods: {
        ...mapActions("Alerting", ["addSingleAlert"]),
        translateKeyWithPlausibilityCheck,
        /**
         * Updates selectedLayers array.
         * @param {Number} filterId id which should be removed or added to selectedLayers array
         * @returns {void}
         */
        updateSelectedLayers (filterId) {
            if (typeof filterId !== "number") {
                return;
            }
            this.$emit("selectedAccordions", filterId);
        },
        /**
         * Emitting the function by transfering the filter Id of layer
         * @param {Number} filterId id to check if should be disabled
         * @returns {void}
         */
        setLayerLoaded (filterId) {
            this.$emit("setLayerLoaded", filterId);
        },
        /**
         * Scrolls to given filterId.
         * @param {Number} filterId The filterId to jump to.
         * @returns {void}
         */
        scrollToView (filterId) {
            if (typeof filterId !== "number" || !this.filters.some(filter => filter.filterId === filterId)) {
                return;
            }
            const filter = Array.isArray(this.$refs[filterId]) ? this.$refs[filterId][0] : this.$refs[filterId];

            if (filter && typeof filter.scrollIntoView === "function") {
                this.$nextTick(() => {
                    filter.scrollIntoView({behavior: "smooth"});
                });
            }
            else {
                this.addSingleAlert(i18next.t("common:modules.filter.alertingMessages.noMatchingFilterId"), {root: true});
            }
            this.$emit("resetJumpToId");
            if (!this.selectedLayers.some(selectedLayer => selectedLayer.filterId === filterId)) {
                this.updateSelectedLayers(filterId);
            }
        },
        setItemRef (el) {
            if (el) {
                this.itemRefs.push(el);
            }
        }
    }
};
</script>

<template>
    <div
        class="panel-group"
        role="tablist"
        aria-multiselectable="true"
    >
        <div
            v-for="filter in filters"
            :id="'filter-' + filter.filterId"
            :ref="setItemRef"
            :key="filter.filterId"
            class="panel panel-default"
        >
            <button
                :disabled="disabled"
                data-toggle="collapse"
                data-parent="#accordion"
                class="d-flex justify-content-between w-100 btn-transparent"
                @click="setLayerLoaded(filter.filterId), updateSelectedLayers(filter.filterId)"
                @keydown.enter="setLayerLoaded(filter.filterId), updateSelectedLayers(filter.filterId)"
            >
                <h2
                    :class="['panel-title', disabled ? 'disabled' : '']"
                >
                    {{ filter.title ? filter.title : filter.layerId }}
                </h2>
                <span
                    v-if="!selectedLayers.some(layers => layers.filterId === filter.filterId)"
                    class="bi bi-chevron-down float-end"
                />
                <span
                    v-else
                    class="bi bi-chevron-up float-end"
                />
            </button>
            <div
                v-if="filter.shortDescription && !selectedLayers.includes(filter.filterId)"
                class="layerInfoText"
            >
                {{ translateKeyWithPlausibilityCheck(filter.shortDescription, key => $t(key)) }}
            </div>
            <slot
                :layer="filter"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
#tool-general-filter .panel {
    background-color: $white;
    border: 1px solid #ddd;
    padding: 10px;
}
.panel-group .panel + .panel {
    margin-top: 10px;
}
.panel-default > .panel-heading {
    cursor: default;
    background-color: $white;
}
.panel-default > .panel-heading.disabled {
    background-color: $light_grey;
}
.panel-title {
    cursor: pointer;
}

.btn-transparent {
    background-color: transparent;
    border: none;
    text-align:left;
}
</style>
