<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import layerFactory from "../../../core/layers/js/layerFactory";
import sortBy from "../../../shared/js/utils/sortBy";
import LayerCheckBox from "../../layerTree/components/LayerCheckBox.vue";
import SearchBar from "../../searchBar/components/SearchBar.vue";
import LayerSelectionTreeNode from "./LayerSelectionTreeNode.vue";

/**
 * Layer Selection
 * @module modules/LayerSelection
 * @vue-data {Number} currentComponentSide - The layer id for the select all checkbox.
 * @vue-data {Number} selectAllConfId - The layer id for the select all checkbox.
 * @vue-data {Array} selectAllConfigs - The layer configurations for select all checkbox.
 */
export default {
    name: "LayerSelection",
    components: {
        LayerCheckBox,
        SearchBar,
        LayerSelectionTreeNode
    },
    data () {
        return {
            selectAllConfId: -1,
            selectAllConfigs: [],
            activeCategory: null
        };
    },
    computed: {
        ...mapGetters("Modules/SearchBar", ["searchInput", "addLayerButtonSearchActive", "currentSide", "showAllResults"]),
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters(["activeOrFirstCategory", "allCategories", "portalConfig"]),
        ...mapGetters("Modules/LayerSelection", ["visible", "subjectDataLayerConfs", "baselayerConfs", "lastFolderNames", "layerInfoVisible", "highlightLayerId"]),
        categorySwitcher () {
            return this.portalConfig?.tree?.categories;
        }
    },
    unmounted () {
        if (!this.layerInfoVisible) {
            this.reset();
        }
        this.setHighlightLayerId(null);
    },
    created () {
        this.activeCategory = this.activeOrFirstCategory?.key;
        this.provideSelectAllProps();
        this.setLayerInfoVisible(false);
    },
    methods: {
        ...mapActions(["changeCategory"]),
        ...mapActions("Modules/LayerSelection", ["navigateBack", "navigateForward", "reset"]),
        ...mapMutations("Modules/LayerSelection", ["setLayerInfoVisible", "setHighlightLayerId"]),

        /**
         * Sorts the configs by type: first folder, then layer.
         * @param {Array} configs list of layer and folder configs
         * @returns {Array} the sorted configs
         */
        sort (configs) {
            return sortBy(configs, (conf) => conf.type !== "folder");
        },
        /**
         * Navigates backwards in folder-menu.
         * @param {Number} level level to go back to
         * @returns {void}
         */
        navigateStepsBack (level) {
            const end = this.lastFolderNames.length - level - 1;

            for (let index = 0; index < end; index++) {
                this.navigateBack();
            }
            this.$nextTick(() => {
                this.selectAllConfId = -1;
                this.selectAllConfigs = [];
                this.provideSelectAllProps();
            });
        },
        /**
         * Listener for click on folder.
         * @param {String} lastFolderName name to show in menu to navigate back to
         * @param {Array} subjectDataLayerConfs configs to show
         * @returns {void}
         */
        folderClicked (lastFolderName, subjectDataLayerConfs) {
            this.navigateForward({lastFolderName, subjectDataLayerConfs: this.sort(subjectDataLayerConfs)});
            this.$nextTick(() => {
                this.selectAllConfId = -1;
                this.selectAllConfigs = [];
                this.provideSelectAllProps();
            });
        },
        /**
         * Returns true, if configuration shall be controlled by SelectAllCheckBox.
         * @param {Object} conf layer or folder configuration
         * @returns {Boolean} true, if configuration shall be controlled by SelectAllCheckBox
         */
        isControlledBySelectAll (conf) {
            return conf.type === "layer" && (this.mode === "2D" ? !layerFactory.getLayerTypes3d().includes(conf.typ?.toUpperCase()) : true);
        },
        /**
         * Provides data for SelectAllCheckBox props.
         * @returns {void}
         */
        provideSelectAllProps () {
            this.subjectDataLayerConfs.forEach(conf => {
                if (this.isControlledBySelectAll(conf) && this.selectAllConfId === -1) {
                    this.selectAllConfigs = this.subjectDataLayerConfs.filter(config => this.isControlledBySelectAll(config));
                    this.selectAllConfId = conf.id;
                }
            });
        },
        /**
         * Changes category after selection.
         * @param {String} value key of the category
         * @returns {void}
         */
        categorySelected (value) {
            if (typeof value === "string") {
                const category = this.allCategories.find(aCategory => aCategory.key === value);

                this.allCategories.forEach(aCategory => {
                    aCategory.active = false;
                });
                category.active = true;
                this.changeCategory(category);
            }
        },
        /**
         * Filters baselayers for mode '2D' or '3D'.
         * @returns {Array} list of filtered baselayers
         */
        filterBaseLayer () {
            if (this.mode === "3D") {
                return this.baselayerConfs.filter(conf => !layerFactory.getLayerTypesNotVisibleIn3d().includes(conf.typ?.toUpperCase()));
            }
            return this.baselayerConfs;
        }
    }
};
</script>

<template>
    <div
        v-if="visible"
        :id="'layer-selection'"
        class="w-100 layer-selection"
        aria-label=""
    >
        <SearchBar
            v-if="addLayerButtonSearchActive === true"
        />
        <div class="layer-selection-navigation d-flex">
            <div
                v-if="showAllResults === false"
                class="layer-selection-navigation"
            >
                <h5
                    v-if="filterBaseLayer().length > 0"
                    class="layer-selection-subheadline"
                >
                    {{ $t("common:modules.layerSelection.backgrounds") }}
                </h5>
                <div class="d-flex justify-content-start layer-selection-navigation-baselayer">
                    <template
                        v-for="(bgConf, index) in filterBaseLayer()"
                        :key="index"
                    >
                        <div class="col baselayer">
                            <LayerCheckBox
                                :conf="bgConf"
                                :is-layer-tree="false"
                            />
                        </div>
                    </template>
                </div>
                <hr
                    v-if="filterBaseLayer().length > 0"
                    class="m-2"
                >
                <div
                    v-if="activeOrFirstCategory && categorySwitcher && lastFolderNames.length === 1"
                    class="form-floating mb-3 mt-3"
                >
                    <select
                        id="select_category"
                        v-model="activeCategory"
                        class="form-select"
                        @change="categorySelected($event.target.value)"
                    >
                        <option
                            v-for="category in allCategories"
                            :key="category.key"
                            :value="category.key"
                        >
                            {{ $t(category.name) }}
                        </option>
                    </select>
                    <label for="select_category">
                        {{ $t("common:modules.layerTree.categories") }}
                    </label>
                </div>
                <div class="align-items-left justify-content-center layer-selection-navigation-dataLayer">
                    <h5
                        v-if="lastFolderNames.length === 1"
                        class="layer-selection-subheadline"
                    >
                        {{ $t("common:modules.layerSelection.datalayer") }}
                    </h5>
                    <nav
                        v-if="lastFolderNames.length > 1"
                        aria-label="breadcrumb"
                        class="position-sticky top-0 bg-white py-3"
                    >
                        <ol
                            class="breadcrumb mb-0"
                        >
                            <li
                                v-for="(lastFolderName, index) in lastFolderNames"
                                :key="index"
                                :class="['breadcrumb-item', index === (lastFolderNames.length -1) ? 'active': '']"
                            >
                                <a
                                    v-if="index < (lastFolderNames.length -1)"
                                    class="mp-menu-navigation"
                                    href="#"
                                    @click="navigateStepsBack(index)"
                                    @keypress="navigateStepsBack(index)"
                                >
                                    <h6 class="mp-menu-navigation-link bold">{{ lastFolderName === "root" ? $t("common:modules.layerSelection.datalayer") : lastFolderName }}</h6>
                                </a>
                                <h6
                                    v-else
                                    class="mp-menu-navigation-link bold no-link"
                                >
                                    {{ lastFolderName }}
                                </h6>
                            </li>
                        </ol>
                    </nav>
                    <template
                        v-for="(conf, idx) in subjectDataLayerConfs"
                        :key="idx"
                    >
                        <LayerSelectionTreeNode
                            :conf="conf"
                            :show-select-all-check-box="selectAllConfId === conf.id"
                            :select-all-configs="selectAllConfigs"
                            @show-node="folderClicked"
                        />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.breadcrumb-item + .breadcrumb-item::before{
    font-weight: bold;
    line-height: 1.2rem;
}

.layer-selection {
    background-color: $menu-background-color;
    left: 0px;
    height: calc(100% - 50px);
    padding-top: 0;
    @media (max-height: 670px) {
        height: calc(100% - 85px);
    }
}
.layer-selection-navigation {
    height: 90%;
    flex-direction: column;
}

.layer-selection-navigation-baselayer {
    overflow-x: scroll;
}
@include media-breakpoint-down(md) {
    .layer-selection-navigation-baselayer {
        max-height: 120px;
    }
}
.layer-selection-navigation-dataLayer {
    @include media-breakpoint-down(md) {
        max-height: calc(100% - 120px);
    }
}

.layer-selection-subheadline {
    margin: 0px 0 15px 0;
}

.mp-menu-navigation{
    color: $black;
    display: flex;
}
.mp-menu-navigation-link{
    display: flex;
}

@include media-breakpoint-up(sm)  {
    .layer-selection-navigation-baselayer {
        overflow-x: auto;
    }
}
.baselayer {
    min-width: 35%;
}
</style>
