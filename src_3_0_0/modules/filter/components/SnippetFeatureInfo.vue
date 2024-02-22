<script>
import isObject from "../../../shared/js/utils/isObject.js";
import openlayerFunctions from "../utils/openlayerFunctions";
import renameKeys from "../../../shared/js/utils/renameKeys.js";
import beautifyKey from "../../../shared/js/utils/beautifyKey.js";
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";

/**
* Snippet Info
* @module modules/SnippetInfo
* @vue-prop {Array} attrName - The list of attribute names.
* @vue-prop {Array} title - The title of the info.
* @vue-prop {String} layerId - The layer id.
* @vue-prop {Number} snippetId - The snippet id.
* @vue-prop {Array} filteredItems - The list of filtered items.
* @vue-prop {Object} universalSearch - The configured universal search object
* @vue-data {Object} featureInfo - (??).
* @vue-data {Boolean} visible - Shows if the info is displayed.
*/
export default {
    name: "SnippetFeatureInfo",
    props: {
        attrName: {
            type: Array,
            required: false,
            default: () => []
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        layerId: {
            type: String,
            required: false,
            default: undefined
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        filteredItems: {
            type: Array,
            required: false,
            default: () => []
        },
        universalSearch: {
            type: [Object, Boolean],
            required: false,
            default: false
        }
    },
    emits: ["setSnippetPrechecked"],
    data () {
        return {
            featureInfo: null,
            visible: false
        };
    },
    computed: {
        titleText () {
            if (typeof this.title === "string") {
                return translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        featureInfoWithoutDuplicates () {
            if (this.featureInfo === null) {
                return [];
            }
            const result = {};

            Object.entries(this.featureInfo).forEach(([key, value]) => {
                result[key] = Array.isArray(value) ? value.join(", ") : value;
            });
            return result;
        }
    },
    watch: {
        filteredItems: {
            handler (items) {
                const attributesObject = this.getUniqueObjectFromAttributes(this.attrName, items),
                    localFeatureInfo = this.featureInfo ? this.featureInfo : {};
                let beautifiedObjects;

                if (attributesObject === null) {
                    this.featureInfo = null;
                    return;
                }

                if (typeof this.gfiAttributes === "undefined") {
                    beautifiedObjects = this.beautifyObjectKeys(attributesObject);
                }
                else {
                    beautifiedObjects = renameKeys(this.gfiAttributes, attributesObject);
                }

                Object.entries(beautifiedObjects).forEach(([key, val]) => {
                    if (!Array.isArray(localFeatureInfo[key])) {
                        localFeatureInfo[key] = [];
                    }
                    val.forEach(value => {
                        if (localFeatureInfo[key].includes(value)) {
                            return;
                        }
                        localFeatureInfo[key].push(value);
                    });
                });
                this.featureInfo = localFeatureInfo;
            },
            deep: true
        },
        featureInfo: {
            handler () {
                if (isObject(this.featureInfo) && Object.keys(this.featureInfo).length > 0) {
                    this.visible = true;
                    return;
                }
                this.visible = false;
            },
            deep: true
        }
    },
    created () {
        if (this.layerId) {
            this.setGfiAttributes(this.layerId);
        }
    },
    mounted () {
        this.$emit("setSnippetPrechecked", false);
    },
    methods: {
        /**
         * Beautify the keys of an object.
         * @param {Object} unlovelyObject - The object to be beautified.
         * @returns {Object} The beautified object.
         */
        beautifyObjectKeys (unlovelyObject) {
            const beautifiedObj = {};

            Object.entries(unlovelyObject).forEach(([key, value]) => {
                beautifiedObj[beautifyKey(key)] = value;
            });
            return beautifiedObj;
        },

        /**
         * Sets the gfiAttributes of a layer by the id if available.
         * and if gfiAttributes are an object. It can also be a string ("ignore" or "showAll").
         * Is used to beautify the keys of the feature info.
         * @param {String} layerId - The id of the layer.
         * @returns {void}
         */
        setGfiAttributes (layerId) {
            const layer = openlayerFunctions.getLayerByLayerId(layerId);

            this.gfiAttributes = isObject(layer?.gfiAttributes) ? layer.gfiAttributes : undefined;
        },

        /**
         * Gets an object with unique list of values for each attribute.
         * @param {String[]} attrName an array of attrNames
         * @param {Object[]} features an array of objects
         * @returns {Object|null} returns object or null if given features is not an array
         */
        getUniqueObjectFromAttributes (attrName, features) {
            if (!Array.isArray(attrName) || !Array.isArray(features) || features.length === 0) {
                return null;
            }
            const uniqueObjects = {},
                result = {};

            features.forEach(feature => {
                attrName.forEach(attr => {
                    if (!isObject(uniqueObjects[attr])) {
                        uniqueObjects[attr] = {};
                    }
                    uniqueObjects[attr][feature.get(attr)] = true;
                });
            });
            Object.entries(uniqueObjects).forEach(([attr, obj]) => {
                result[attr] = [];
                Object.keys(obj).forEach(value => {
                    if (value === "undefined") {
                        result[attr].push("");
                        return;
                    }
                    result[attr].push(value);
                });
            });

            return result;
        },

        /**
         * Checks if the attribute should be searched in webpage.
         * @param {Object|Boolean} universalSearch the universalSearch parameter with prefix and attribute name.
         * @param {String} attr the attribute name
         * @returns {Boolean} returns true if this attribute should be searched in webpage.
         */
        checkAttrInSearch (universalSearch, attr) {
            if (!isObject(universalSearch)) {
                return false;
            }
            if (!universalSearch?.attrName || !universalSearch?.prefix) {
                return false;
            }
            if (typeof attr !== "string") {
                return false;
            }
            return universalSearch.attrName === attr;
        }
    }
};
</script>

<template>
    <div
        v-if="visible"
        class="snippetFeatureInfoContainer"
    >
        <h6 v-if="title">
            {{ titleText }}
        </h6>
        <dl class="row">
            <template
                v-for="(value, key, index) in featureInfoWithoutDuplicates"
                :key="key + index"
            >
                <dt
                    class="col-sm-4"
                >
                    {{ key }}&#58;
                </dt>
                <template v-if="value === ''">
                    <dd
                        :key="key"
                        class="col-sm-8"
                    >
                        ---
                    </dd>
                </template>
                <template v-else>
                    <dd
                        :key="key"
                        class="col-sm-8"
                    >
                        {{ value }}
                        <a
                            v-if="checkAttrInSearch(universalSearch, key)"
                            :href="universalSearch.prefix + value"
                            :aria-label="value"
                            :title="$t('common:modules.filter.universalSearchTitle')"
                            target="_blank"
                        >
                            <i
                                class="bi-search"
                                role="img"
                            />
                        </a>
                    </dd>
                </template>
            </template>
        </dl>
    </div>
</template>

<style lang="scss" scoped>
    .snippetFeatureInfoContainer {
        border: 1px solid #ddd;
        padding: 8px;
        h6 {
            color: #E10019
        }
        .row {
            margin-bottom: 0;
            dt {
                font-weight: normal;
            }
            dd {
                a {
                    color: #151C27;
                    margin-left: 20px;
                }
            }
        }
    }
</style>
