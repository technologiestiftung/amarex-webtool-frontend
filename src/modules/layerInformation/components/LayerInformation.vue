<script>
import ToolWindow from "../../../share-components/ToolWindow.vue";
import {mapActions, mapGetters} from "vuex";

/**
 * The Layer Information that gives the user information, links and the legend for a layer
 */
export default {
    name: "LayerInformation",
    components: {
        ToolWindow
    },
    data () {
        return {
            openDropdown: false
        };
    },
    computed: {
        ...mapGetters(["metaDataCatalogueId"]),
        showMoreLayers () {
            if (this.layerInfo.metaIdArray) {
                return this.layerInfo.metaIdArray.length > 1 && !this.layerInfo.metaIdArray.every(item => item === null);
            }
            return false;
        },
        showInformation () {
            return this.active;
        }
    },

    mounted () {
        // might be caught from self when triggerClose() is called
        Backbone.Events.listenTo(Radio.channel("Layer"), {
            "setLayerInfoChecked": (value) => {
                if (!value) {
                    this.close();
                }
            }
        });
    },

    methods: {
        ...mapActions("LayerInformation", [
            "changeLayerInfo",
            "activate"
            // "setConfigParams"
        ]),
        // ...mapMutations("LayerInformation", Object.keys(mutations)),
        /**
         * Closes the LayerInformation
         * @returns {void}
         */
        close () {
            this.setActive(false);
            this.$emit("close");
        },
        /**
         * Trigger (Radio) close related events
         * @returns {void}
         */
        triggerClose () {
            Radio.trigger("Layer", "setLayerInfoChecked", false);
            Radio.trigger("LayerInformation", "unhighlightLayerInformationIcon");
        },
        /**
         * Changes the abstract Text in case of group layer, closes the dropdown manually
         * @param {Event} ev click event of dropdown
         * @returns {void}
         */
        changeLayerAbstract (ev) {
            ev.stopPropagation();
            this.changeLayerInfo(ev.target.text);
            this.setCurrentLayerName(ev.target.text);
            this.openDropdown = false;
        },
        /**
         * stops the click event from closing the menu tree
         * @param {String} evt click event
         * @returns {void}
         */
        onClick (evt) {
            evt.stopPropagation();
        },
        /**
         * stops the click event from closing the menu tree but also opens the dropdown Menu
         * @param {String} evt click event
         * @returns {void}
         */
        onClickDropdown (evt) {
            evt.stopPropagation();
            this.openDropdown = true;
        },
        setConfigs () {
            this.setConfigParams(Config);
        },
        /**
         * generates a GetCapabilities URL from a given service base address and type
         * @param {String} url service base URL
         * @param {String} typ service type (e.g., WMS)
         * @returns {String} GetCapabilities URL
         */
        getGetCapabilitiesUrl ({url, typ}) {
            const urlObject = new URL(url, location.href);

            if (typ !== "OAF") {
                urlObject.searchParams.set("SERVICE", typ);
                urlObject.searchParams.set("REQUEST", "GetCapabilities");
            }
            return urlObject.href;
        }
    }
};
</script>

<template lang="html">
    <ToolWindow
        v-if="showInformation"
        id="layerInformation"
        class="layerInformation"
        @close="triggerClose"
    >
        <template #title>
            <span>{{ $t("common:modules.layerInformation.informationAndLegend") }}</span>
        </template>
        <template #body>
            <div class="body">
                <div
                    v-if="showMoreLayers"
                    class="dropdown mb-2"
                >
                    <button
                        id="changeLayerInfo"
                        class="btn btn-outline-default dropdown-toggle"
                        :class="{ show: openDropdown }"
                        type="button"
                        @click="onClickDropdown"
                    >
                        {{ $t("common:modules.layerInformation.changeLayerInfo") }}
                        <span class="caret" />
                    </button>
                    <ul
                        class="dropdown-menu"
                        :class="{ show: openDropdown }"
                    >
                        <li
                            v-for="name in layerInfo.layerNames"
                            :key="name"
                        >
                            <a
                                href="#"
                                class="dropdown-item abstractChange"
                                :class="{ active: name === currentLayerName }"
                                @click="changeLayerAbstract"
                            >{{ $t(name) }}</a>
                        </li>
                    </ul>
                </div>
                <div
                    class="mb-2 abstract"
                    v-html="abstractText"
                />
            </div>
        </template>
    </ToolWindow>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .subtitle {
        color: $light_red;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        max-width: 100%;
        padding-top: 1px;
        margin-bottom: 9px;
    }
    hr {
        margin: 15px 0 10px 0;
    }

    .body {
        >ul {
            background-color: $white;
        }
        max-height: 66vh;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 5px 10px;
        font-size: $font-size-base;
    }

    .layerInformation {
        position: absolute;
        overflow: unset;
        top: 20px;
        right: 60px;
        max-width:600px;
        width: 45vw;
        margin: 0 10px 30px 10px;
        z-index: 1010;
        background-color: $white;
        box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.176);
        border: 1px solid $light_grey;

        @include media-breakpoint-down(sm) {
            inset: 12px auto auto 0;
            max-width:750px;
            width: 95vw;
            max-height: 80vh;
        }
    }

    .header {
        padding: 10px 10px 5px 10px;
        border-bottom: 1px solid $light_grey;
        cursor: move;
    }
    .bi-x-lg {
        &:hover {
            opacity: 0.7;
            cursor: pointer;
        }
    }

    .nav-tabs {
        display: flex;
        >li {
            font-size: $font-size-base;
            >a {
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
    }
    .tab-content {
        .tab-pane {
            >ul {
                >li {
                    >a {
                        font-size: $font-size-base;
                        text-overflow: ellipsis;
                        display: inline-block;
                        max-width: 95%;
                        overflow: hidden;
                    }
                }
            }
        }
        #layerinfo-legend {
            max-width: 95%;
            overflow: auto;
        }
    }

    .mb-2 {
        margin-bottom: 2rem;
    }

    .dropdown-toggle {
        width: 100%;
    }

    .dropdown-menu {
        width: 100%;
        a.active {
            background-color: $accent_active;
            color: white;
        }
        a:hover {
            background-color: $accent_hover;
        }
    }

    .download-note {
        font-weight: bold;
    }

    .pt-5 {
        padding-top: 5px;
    }

</style>
