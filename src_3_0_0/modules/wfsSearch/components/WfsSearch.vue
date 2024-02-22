<script>
import ModalItem from "../../../shared/modules/modals/components/ModalItem.vue";
import ListItem from "../../../shared/modules/list/components/ListItem.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import WfsSearchLiteral from "./WfsSearchLiteral.vue";
import {createUserHelp} from "../js/literalFunctions";
import requestProvider from "../js/requests";
import isObject from "../../../shared/js/utils/isObject";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";

/**
 * Wfs Search
 * @module modules/WfsSearch
 * @vue-props {Number} zoomLevelProp - Can be set if a zoom level (after succesfull parcel search) is required that is different from the configured one.
 * @vue-props {Boolean} showResetButton - Can be set to false to not render a reset button.
 * @vue-computed {Object} headers - The table heads (??).
 * @vue-computed {String} geometryName - The name of the geometry.
 * @vue-computed {Boolean} showResults - Shows if results should be displayed.
 */
export default {
    name: "WfsSearch",
    components: {
        WfsSearchLiteral,
        ListItem,
        ModalItem,
        FlatButton
    },
    props: {
        zoomLevelProp: {
            type: Number,
            required: false,
            default: undefined
        },
        showResetButton: {
            type: Boolean,
            required: false,
            default: true
        },
        resetParcelSearch: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        ...mapGetters("Modules/WfsSearch", [
            "name",
            "instances",
            "userHelp",
            "results",
            "searched",
            "service",
            "showResultList",
            "zoomLevel",
            "resultsPerPage",
            "multiSelect",
            "currentInstance",
            "requiredFields"
        ]),
        ...mapGetters("Modules/Language", ["currentLocale"]),
        headers () {
            if (this.results.length === 0) {
                return null;
            }

            const {resultList} = this.currentInstance;

            if (isObject(resultList)) {
                return Object.assign({}, resultList);
            }
            if (resultList === "showAll") {
                const lengths = this.results.map(feature => Object.keys(feature.values_).length),
                    indexOfFeatureWithMostAttr = lengths.indexOf(Math.max(...lengths));

                return Object.keys(this.results[indexOfFeatureWithMostAttr].values_)
                    .reduce((acc, curr) => {
                        acc[curr] = curr;
                        return acc;
                    }, {});
            }
            return null;
        },
        geometryName () {
            return this.results[0].getGeometryName();
        },
        showResults () {
            return this.showResultList;
        }
    },
    watch: {
        currentLocale () {
            if (this.userHelp !== "hide") {
                createUserHelp(this.currentInstance.literals);
            }
        },
        resetParcelSearch (val) {
            if (val) {
                this.resetUI();
            }
        }
    },
    created () {
        this.prepareModule();

    },
    unmounted () {
        this.resetModule(true);
    },
    methods: {
        ...mapMutations("Modules/WfsSearch", [
            "setSearched",
            "setResults",
            "setShowResultList",
            "setZoomLevel"
        ]),
        ...mapActions("Modules/WfsSearch", [
            "instanceChanged",
            "prepareModule",
            "resetModule",
            "resetResult"
        ]),
        ...mapActions("Maps", ["placingPointMarker", "setCenter", "setZoom"]),
        /**
         * Resets the selection and inputs fields and the results.
         * @returns {void}
         */
        resetUI () {
            const inputFields = document.getElementsByClassName("module-wfsSearch-field-input");

            for (const input of inputFields) {
                input.value = "";
            }
            this.resetResult();
        },
        /**
         * Searches the configured service and shows adds the results to the List in the Modal.
         * @returns {Promise<void>} The returned promise isn't used any further as it resolves to nothing.
         */
        async search () {
            this.setSearched(true);
            const features = await requestProvider.searchFeatures(this.$store, this.currentInstance, this.service);

            this.setResults([]);
            features.forEach(feature => {
                this.results.push(feature);
            });

            if (this.currentInstance?.resultList !== undefined) {
                document.getElementById("module-wfsSearch-button-showResults").focus();
                this.setShowResultList(true);
            }
            else if (features.length > 0) {
                this.placingPointMarker(features[0].getGeometry().getCoordinates());
                this.setCenter(features[0].getGeometry().getCoordinates());
                this.setZoom(this.zoomLevelProp || this.zoomLevel);
                this.setShowResultList(false);
            }
            else {
                this.setShowResultList(true);
            }
        }
    }
};
</script>

<template>
    <div>
        <div>
            <form
                role="form"
                @submit.prevent="search"
            >
                <template
                    v-if="instances.length > 1"
                >
                    <div class="form-floating">
                        <select
                            id="module-wfsSearch-instances-select"
                            class="form-select"
                            @change="instanceChanged($event.currentTarget.value)"
                        >
                            <option
                                v-for="({title}, i) of instances"
                                :key="title + i"
                                :value="i"
                            >
                                {{ $t(title) }}
                            </option>
                        </select>
                        <label
                            id="module-wfsSearch-instances-select-label"
                            for="module-wfsSearch-instances-select"
                        >
                            {{ $t("common:modules.wfsSearch.instancesSelectLabel") }}
                        </label>
                    </div>
                </template>
                <div
                    v-if="userHelp !== 'hide'"
                    id="module-wfsSearch-userHelp"
                    class="justify-content-center mt-3"
                >
                    <i
                        id="module-wfsSearch-userHelp-icon"
                        class="col-md-1 bi-info-circle me-3"
                    />
                    <span
                        id="module-wfsSearch-userHelp-text"
                        class="col-md-11"
                        :aria-label="$t('common:modules.wfsSearch.userHelp.label')"
                        v-html="$t('common:modules.wfsSearch.userHelp.text', {userHelp})"
                    />
                </div>
                <div
                    v-for="(literal, i) of currentInstance.literals"
                    :key="'module-wfsSearch-clause' + i"
                >
                    <WfsSearchLiteral
                        :literal="literal"
                    />
                </div>
                <div>
                    <div class="col-md-12 d-flex justify-content-center mt-3">
                        <FlatButton
                            id="module-wfsSearch-button-search"
                            :type="'submit'"
                            :text="$t('common:modules.wfsSearch.searchButton')"
                            :icon="'bi-search'"
                            :disabled="requiredFields"
                        />
                    </div>
                    <div
                        v-if="showResetButton"
                        class="col-md-12 d-flex justify-content-center"
                    >
                        <FlatButton
                            id="module-wfsSearch-button-resetUI"
                            :interaction="resetUI"
                            :text="$t('common:modules.wfsSearch.resetButton')"
                            :icon="'bi-x'"
                        />
                    </div>
                    <div
                        v-if="searched && instances[0].resultList !== undefined"
                        class="col-md-12"
                    >
                        <FlatButton
                            id="module-wfsSearch-button-showResults"
                            :interaction="setShowResultList(true)"
                            :text="$t('common:modules.wfsSearch.showResults') + ' ' + `(${results.length})`"
                            :icon="'bi-x'"
                            :disabled="results.length === 0 || !headers"
                        />
                    </div>
                </div>
            </form>
        </div>
        <ModalItem
            :title="$t(name)"
            :show-modal="showResults"
            modal-inner-wrapper-style="padding: 10px;min-width: 70vw;"
            modal-content-container-style="padding: 0;overflow: auto;max-height: 70vh;"
            @modal-hid="setShowResultList(false)"
        >
            <template v-if="showResults && results.length">
                <header>
                    <h4>{{ currentInstance.resultDialogTitle ? $t(currentInstance.resultDialogTitle) : $t(name) }}</h4>
                </header>
                <ListItem
                    :key="'module-wfsSearch-list'"
                    :identifier="$t(name)"
                    :geometry-name="geometryName"
                    :table-heads="headers"
                    :table-data="results"
                    :on-row-click-callback="setShowResultList.bind(this, false)"
                    :max-zoom="zoomLevel"
                    :results-per-page="resultsPerPage"
                    :multi-select="multiSelect"
                />
            </template>
            <template v-else>
                <header>
                    <h4>{{ $t(name) }}</h4>
                </header>
                <span>{{ $t("common:modules.wfsSearch.noResults") }}</span>
            </template>
        </ModalItem>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    .btn {
        margin-top: 10px;
    }
    .form-group > span {
        display: inline-block;
    }
    .title {
            font-size: $font-size-base;
    }
</style>
