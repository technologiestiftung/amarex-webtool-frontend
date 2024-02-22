<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import LightButton from "../../../shared/modules/buttons/components/LightButton.vue";
import ModalItem from "../../../shared/modules/modals/components/ModalItem.vue";

/**
 * Wfs Transaction
 * @module modules/WfsTransaction
 */
export default {
    name: "WfsTransaction",
    components: {LightButton, ModalItem},
    computed: {
        ...mapGetters("Modules/Wfst", ["currentInteractionConfig", "currentLayerIndex", "featureProperties", "layerIds", "layerInformation", "layerSelectDisabled", "layerSelectLabel", "selectedInteraction", "showInteractionsButtons", "deactivateGFI", "icon", "name", "transactionProcessing", "showConfirmModal"]),
        ...mapGetters(["allLayerConfigs"])
    },
    created () {
        const newLayerInformation = this.allLayerConfigs.filter(item => this.layerIds.includes(item.id)).reverse(),
            firstActiveLayer = newLayerInformation.findIndex(layer => layer.visibility),
            currentLayerDeactivated = this.currentLayerIndex > -1 && !newLayerInformation[this.currentLayerIndex].visibility;

        this.setLayerInformation(newLayerInformation);
        if ((this.currentLayerIndex === -1 && firstActiveLayer > -1) ||
            (this.currentLayerIndex > -1 && firstActiveLayer === -1) ||
            (currentLayerDeactivated && firstActiveLayer > -1)) {
            this.setCurrentLayerIndex(firstActiveLayer);
        }
        if (currentLayerDeactivated) {
            this.reset();
        }
        this.setFeatureProperties();
    },
    methods: {
        ...mapMutations("Modules/Wfst", ["setTransactionProcessing", "setCurrentLayerIndex", "setLayerInformation", "setShowConfirmModal"]),
        ...mapActions("Modules/Wfst", ["prepareInteraction", "reset", "save", "setFeatureProperty", "setFeatureProperties", "sendTransaction"]),
        /**
         * Changes the layer index according user selection
         * @param {Number} index Index of the layer
         * @returns {void}
         */
        layerChanged (index) {
            this.setCurrentLayerIndex(index);
            this.setFeatureProperties();
            this.reset();
        },
        /**
         * Handles the input types
         * @param {String} type Input type
         * @returns {String} Input type
         */
        getInputType (type) {
            if (type === "string") {
                return "text";
            }
            if (["integer", "int", "decimal", "short", "float"].includes(type)) {
                return "number";
            }
            if (type === "boolean") {
                return "checkbox";
            }
            if (type === "date") {
                return "date";
            }
            return "";
        }
    }
};
</script>

<template lang="html">
    <div>
        <div id="tool-wfsTransaction-container">
            <div id="tool-wfsTransaction-layerSelect-container">
                <label
                    id="tool-wfsTransaction-layerSelect-label"
                    for="tool-wfsTransaction-layerSelect"
                >
                    {{ $t(layerSelectLabel) }}
                </label>
                <select
                    id="tool-wfsTransaction-layerSelect"
                    class="form-select"
                    :disabled="layerSelectDisabled"
                    @change="layerChanged($event.target.options.selectedIndex)"
                >
                    <option
                        v-for="(layer, index) of layerInformation"
                        :key="layer.id"
                        :selected="index === currentLayerIndex"
                    >
                        {{ $t(layer.name) }}
                    </option>
                </select>
            </div>
            <template v-if="typeof featureProperties === 'string'">
                <div id="tool-wfsTransaction-layerFailure">
                    {{ $t(featureProperties) }}
                </div>
            </template>
            <div
                v-else-if="showInteractionsButtons"
                id="tool-wfsTransaction-interactionSelect-container"
                class="btn-toolbar mb-3"
            >
                <div
                    class="btn-group flex-wrap mr-1 mt-5"
                    role="group"
                    aria-label="Control buttons"
                >
                    <template v-for="(config, key) in currentInteractionConfig">
                        <LightButton
                            v-if="config.available"
                            :id="key"
                            :key="key"
                            :text="config.text"
                            :icon="config.icon"
                            :interaction="() => prepareInteraction(key)"
                        />
                    </template>
                </div>
            </div>
            <template v-else>
                <div id="tool-wfsTransaction-form-container">
                    <hr>
                    <p v-if="currentInteractionConfig.Polygon.available">
                        {{ $t("common:modules.wfst.polygonHint") }}
                    </p>
                    <form
                        id="tool-wfsTransaction-form"
                    >
                        <template v-for="property of featureProperties">
                            <template v-if="property.type !== 'geometry'">
                                <label
                                    :key="`${property.key}-label`"
                                    :for="`tool-wfsTransaction-form-input-${property.key}`"
                                    class="form-label"
                                >
                                    {{ $t(property.label) }}
                                </label>
                                <input
                                    v-if="getInputType(property.type) ==='checkbox'"
                                    :id="`tool-wfsTransaction-form-input-${property.key}`"
                                    :key="`${property.key}-input-checkbox`"
                                    :type="getInputType(property.type)"
                                    :required="property.required"
                                    :checked="['true', true].includes(property.value) ? true : false"
                                    @input="event => setFeatureProperty({key: property.key, type: getInputType(property.type), value: event.target.checked})"
                                >
                                <input
                                    v-else
                                    :id="`tool-wfsTransaction-form-input-${property.key}`"
                                    :key="`${property.key}-input`"
                                    class="form-control"
                                    :type="getInputType(property.type)"
                                    :required="property.required"
                                    :value="property.value"
                                    @input="event => setFeatureProperty({key: property.key, type: getInputType(property.type), value: event.target.value})"
                                >
                            </template>
                        </template>
                        <div id="tool-wfsTransaction-form-buttons">
                            <LightButton
                                :interaction="reset"
                                text="common:modules.wfst.form.discard"
                            />
                            <LightButton
                                :interaction="save"
                                text="common:modules.wfst.form.save"
                                type="button"
                            />
                        </div>
                    </form>
                </div>
            </template>
        </div>
        <div class="d-flex justify-content-center mt-1">
            <div
                v-if="transactionProcessing"
                class="spinner-border"
            />
        </div>
        <ModalItem
            :show-modal="showConfirmModal"
            modal-inner-wrapper-style="padding: 10px;min-width: 30em;"
            modal-1-content-container-style="padding: 0;overflow: auto;max-height: 30em;"
        >
            <div id="confirmActionContainer">
                <h3>
                    {{ $t("common:modules.wfst.deleteInteraction.headline") }}
                </h3>
                <p
                    id="confirmation-textContent"
                >
                    {{ $t("common:modules.wfst.deleteInteraction.text") }}
                </p>

                <div
                    id="confirmation-button-container"
                    name="footer"
                >
                    <button
                        id="modal-button-left"
                        class="btn btn-secondary"
                        @click="sendTransaction(); setShowConfirmModal(false)"
                    >
                        {{ $t("common:modules.button.confirm") }}
                    </button>
                    <button
                        id="modal-button-right"
                        class="btn btn-secondary"
                        @click="setShowConfirmModal(false)"
                    >
                        {{ $t("common:modules.button.stop") }}
                    </button>
                </div>
            </div>
        </ModalItem>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

#delete:focus, #update:focus {
    background-color:$light_blue;
}
.spinner-border {
    border: 4px solid $primary;
    border-radius: 50%;
    border-top: 4px solid $dark_blue;
    width: 25px;
    height: 25px;
}
h3 {
    border:none;
    color: grey;
    font-size:14px;
    font-weight:bold;
    letter-spacing:initial;
    line-height:18px;
    padding:0;
}
#confirmation-textContent {
    color:#777777;
    font-size:12px;
}
#confirmation-button-container {
    overflow:hidden;
    margin-top:12px;
}
#modal-button-left {
    float:left;
    margin: 0 12px 0 0;
}
#modal-button-right {
    float:right;
    margin: 0 0 0 12px;
}
#tool-wfsTransaction-container {
    #tool-wfsTransaction-layerSelect-container {
        display: flex;
        justify-content: space-between;
        width: 25em;

        #tool-wfsTransaction-layerSelect-label {
            width: 5em;
            align-self: center;
            margin-right: 1em;
        }
    }

    #tool-wfsTransaction-layerFailure {
        display: flex;
        justify-content: center;
        align-content: center;
        margin-top: 1em;
    }

   #tool-wfsTransaction-interactionSelect-container {
        button {
            border-radius: 0
        }
    }

    #tool-wfsTransaction-form {
        margin-top: 1em;
        display: grid;
        grid-template-columns: 5em 20em;
        grid-row-gap: calc(#{1em} / 3);

        label {
            align-self: center;
            margin: 0;
        }
    }

    #tool-wfsTransaction-form-buttons {
        display: grid;
        grid-template-columns: repeat(2, 12.5em);
        margin-top: calc(#{1em} / 2);

        button:first-child {
            margin-right: calc(#{1em} / 2);
        }
        button:last-child {
            margin-left: calc(#{1em} / 2);
        }
    }
}
</style>
