<script>
import draggable from "vuedraggable";
import {mapActions, mapGetters} from "vuex";

import Layer from "./LayerComponent.vue";
import {sortObjects} from "../../../shared/js/utils/sortObjects";

/**
 * Should be removed again after removing the compat mode
 * @see {@link https://www.npmjs.com/package/vuedraggable/v/4.1.0?activeTab=versions}
 * @see {@link https://github.com/SortableJS/vue.draggable.next/issues/122}
 */
draggable.compatConfig = {MODE: 3};

/**
 * Representation of a node in layertree containing folders or layers.
 * @module modules/layerTree/components/LayerTreeNode
 * @vue-data {Boolean} isOpen - Shows if node is open.
 * @vue-computed {Object} sortedLayerConfig - The v-model for sorted layerConfig.
 */
export default {
    name: "LayerTreeNode",
    components: {
        Draggable: draggable,
        Layer
    },
    data () {
        return {
            isOpen: false
        };
    },
    computed: {
        ...mapGetters(["portalConfig", "allLayerConfigs", "layerConfigsByAttributes", "showLayerAddButton"]),
        ...mapGetters("Modules/LayerTree", ["delay", "delayOnTouchOnly", "removeOnSpill", "touchStartThreshold"]),

        /**
         * v-model for sorted layerConfig.
         */
        sortedLayerConfig: {
            /**
             * Gets the layerconfigs sorted by zIndex.
             * @returns {void}
             */
            get () {
                let sortedLayerConfig;

                if (this.showLayerAddButton) {
                    sortedLayerConfig = this.layerConfigsByAttributes({showInLayerTree: true});
                }
                else {
                    sortedLayerConfig = this.allLayerConfigs;
                }
                sortObjects(sortedLayerConfig, "zIndex", "desc");

                return sortedLayerConfig;
            },
            /**
             * Sets the changed layer Configs order.
             * @param {Object[]} changedLayerConfig The layer configs with changed order
             * @returns {void}
             */
            set (changedLayerConfig) {
                let configLength = changedLayerConfig.length;

                changedLayerConfig.forEach(conf => {
                    conf.zIndex = --configLength;
                    this.replaceByIdInLayerConfig(conf);
                });
            }
        }
    },
    methods: {
        ...mapActions("Modules/LayerTree", ["removeLayer", "replaceByIdInLayerConfig"]),

        /**
         * Indicates if a conf is a layer and showInlayerTree has true.
         * @param {Object} conf The current layer configuration.
         * @returns {void}
         */
        isLayerShowInLayerTree (conf) {
            return conf?.type === "layer" && conf?.showInLayerTree === true;
        },

        /**
         * Returns a layer array element.
         * @param {Object} conf The current layer configuration.
         * @returns {void}
         */
        getLayerArray (conf) {
            return conf?.elements ? conf.elements.filter(el => el.type === "layer" && el.showInLayerTree === true) : [];
        },

        /**
         * Removes the spilled layer from layer tree.
         * @param {Event} event The spill event.
         * @returns {void}
         */
        removeLayerOnSpill (event) {
            this.removeLayer(this.sortedLayerConfig[event.oldIndex]);
        }
    }
};
</script>

<template>
    <!-- eslint-disable vue/attribute-hyphenation -->
    <!-- onSpill callback only works in camelCase -->
    <Draggable
        v-model="sortedLayerConfig"
        class="dragArea no-list ps-0 ms-2"
        tag="ul"
        item-key="name"
        chosen-class="chosen"
        handle=".handle-layer-component-drag"
        :delay-on-touch-only="delayOnTouchOnly"
        :delay="delay"
        :remove-on-spill="removeOnSpill"
        :touch-start-threshold="touchStartThreshold"
        :onSpill="removeLayerOnSpill"
    >
        <template #item="{ element }">
            <li>
                <Layer
                    v-if="isLayerShowInLayerTree(element)"
                    :conf="element"
                />
                <Layer
                    v-for="(layer, i) in getLayerArray(element)"
                    v-else-if="getLayerArray(element).length > 0"
                    :key="'layer' + i"
                    :conf="layer"
                />
            </li>
        </template>
    </Draggable>
</template>


<style lang="scss" scoped>
@import "~variables";
    .no-list{
        list-style: none;
    }

    .chosen {
        color: $light_grey_contrast;
        background-color: lighten($accent_hover, 10%);
        padding: 0;
        border-radius: 10px;
    }
</style>
