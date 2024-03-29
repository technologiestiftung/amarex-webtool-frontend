<script>
import DefaultTheme from "../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../themes/sensor/components/SensorTheme.vue";
import {mapGetters} from "vuex";
import getTheme from "../../utils/getTheme";
import Overlay from "ol/Overlay.js";
import "bootstrap/js/dist/tooltip";
import Popover from "bootstrap/js/dist/popover";

export default {
    name: "AttachedTemplate",
    components: {
        DefaultTheme,
        SensorTheme
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            overlay: new Overlay({element: undefined})
        };
    },
    computed: {
        ...mapGetters("Maps", ["clickCoordinate"]),
        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature?.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        }
    },
    watch: {
        /**
         * When the feature changes, the popover is redrawn to keep the position of the click coordinate.
         * @returns {void}
         */
        feature () {
            this.$nextTick(() => {
                const popover = Popover.getInstance(this.overlay.getElement());

                popover.update();
            });
        }
    },
    created () {
        this.setFocusToFirstControl();
    },
    mounted () {
        this.createOverlay();
        this.createPopover();
    },
    beforeUnmount () {
        mapCollection.getMap("2D").removeOverlay(this.overlay);
    },
    methods: {
        close (event) {
            if (event.type === "click" || event.which === 32 || event.which === 13) {
                this.$emit("close");
            }
        },

        /**
         * It will create an overlay for the attached theme.
         * @returns {void}
         */
        createOverlay () {
            const gfipopup = document.createElement("DIV");

            gfipopup.id = "gfipopup";
            document.body.appendChild(gfipopup);
            this.overlay.setElement(document.getElementById("gfipopup"));
            mapCollection.getMap("2D").addOverlay(this.overlay);
            this.overlay.setPosition(this.clickCoordinate);
        },

        /**
         * It will create the popup window as attached theme.
         * @returns {void}
         */
        createPopover () {
            // Upgrade to BT5
            const popover = new Popover(this.overlay.getElement(), {
                content: this.$el,
                html: true,
                boundary: ".ol-viewport",
                selector: "#gfipopup",
                // place popup next to overlay element, necessary for correct popover removal
                container: this.overlay.getElement().parentElement,
                placement: "top",
                fallbackPlacements: ["bottom"]
            });

            popover.show();
        },

        /**
         * In case they key exists, returns its translation. In case the key doesn't exist returns the key.
         * @param {String} key the key to translate
         * @param {Object} [options=null] for interpolation, formating and plurals
         * @returns {String} the translation or the key itself
         */
        translate (key, options = null) {
            if (i18next.exists(key)) {
                return this.$t(key, options);
            }

            return key;
        },
        /**
         * Sets the focus to the first control (close-button)
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                // otherwise setting the focus was not possible in modal dialog
                setTimeout(() => {
                    if (this.$refs["gfi-close-button"]) {
                        this.$refs["gfi-close-button"].focus();
                    }
                }, 100);
            });
        }
    }
};
</script>

<template>
    <div class="gfi-attached">
        <!-- header -->
        <div class="gfi-header row">
            <h5 class="col-11">
                {{ translate(title) }}
            </h5>
            <button
                ref="gfi-close-button"
                class="close btn btn-sm col-1 d-flex justify-content-center align-content-center"
                aria-label="Close"
                tabindex="0"
                @click="close"
                @keydown="close"
            >
                <span class="bootstrap-icon">
                    <i class="bi-x-lg" />
                </span>
            </button>
        </div>
        <!-- theme -->
        <div
            class="gfi-content"
        >
            <component
                :is="theme"
                :feature="feature"
            />
        </div>
        <slot name="footer" />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    button.close {
        height: fit-content;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
    .gfi-attached {
        background-color: $white;
    }
    .gfi-header {
        padding: 0 15px;
        border-bottom: 1px solid $light_grey;
        h5 {
            font-size: $font_size_big;
            font-family: $font_family_accent;
            line-height: 17px;
            color: $dark_grey;
            padding-top: 10px;
            padding-left: 5px;
        }
        button {
            opacity: 0.6;
        }
    }
    .gfi-content {
        overflow: auto;
        table {
            margin-bottom: 0;
        }
    }
    @include media-breakpoint-up(sm) {
    .gfi-content {
        max-height: 40vh;
        width: 100%;
    }
   }

</style>

<style lang="scss">
    .popover {
        padding: 0 !important;
        width: max-content;
        max-width: 40vw !important;
        border: 0 !important;
        z-index: 1 !important;
    }
    .popover-body {
        padding: 5px !important;
    }
</style>
