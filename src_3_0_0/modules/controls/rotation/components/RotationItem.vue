<script>
import {mapGetters, mapMutations} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * Control to display current map rotation.
 * @module modules/controls/rotation/components/RotationItem
 * @vue-data {Number} [rotation=0] - current rotation.
 */
export default {
    name: "RotationItem",
    components: {
        ControlIcon
    },
    data () {
        return {
            rotation: 0
        };
    },
    computed: {
        ...mapGetters("Controls/Rotation", ["icon", "showAlways"]),
        ...mapGetters(["controlsConfig"])
    },
    mounted () {
        if (this.controlsConfig?.rotation?.showAlways) {
            this.setShowAlways(this.controlsConfig.rotation.showAlways);
        }
        this.$nextTick(() => {
            mapCollection.getMapView("2D").on("change:rotation", this.updateRotation);
        });
    },
    methods: {
        ...mapMutations("Controls/Rotation", ["setShowAlways"]),
        /**
         * Updates the rotation of the control icon.
         * @param {Event} event the mapView rotation event.
         * @returns {void}
         */
        updateRotation (event) {
            this.rotation = event.target.getRotation();
            if (this.$el.querySelector && this.$el.querySelector("i")) {
                this.$el.querySelector("i").style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad)`;
            }
        },
        /**
         * Set the mapView to north.
         * @returns {void}
         */
        setToNorth () {
            mapCollection.getMapView("2D").animate({rotation: 0});
        }
    }
};
</script>

<template>
    <div
        v-if="rotation !== 0 || showAlways"
        id="rotation-control"
    >
        <ControlIcon
            ref="iconControl"
            class="rotation-control-icon"
            :icon-name="icon"
            title="Rotation"
            :disabled="false"
            :on-click="setToNorth"
        />
    </div>
</template>

<style lang="scss" scoped>
.rotation-control-icon{
    transform: rotate(-45deg);
}
</style>
