<script>
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";

/**
 * Represents an sub menu button for a layer in the layertree.
 * @module modules/layerTree/components/LayerComponentIconSubMenu
 * @vue-prop {Object} layerConf - The current layer configuration.
 */
export default {
    name: "LayerComponentIconSubMenu",
    components: {IconButton},
    props: {
        /** current layer configuration */
        layerConf: {
            type: Object,
            required: true
        }
    }
};
</script>

<template lang="html">
    <div
        :id="'layer-component-icon-sub-menu-' + layerConf.id"
        class="layer-component-icon-sub-menu"
    >
        <IconButton
            :id="'layer-component-icon-sub-menu-button-' + layerConf.id"
            :class-array="['btn-light']"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse-sub-menu-' + layerConf.id.split('.').join('_')"
            :icon="'bi-sliders'"
            :aria="$t('common:modules.layerTree.iconSubMenu')"
        />
    </div>
</template>

