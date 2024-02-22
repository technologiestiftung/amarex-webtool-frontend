<script>
import {mapActions, mapGetters} from "vuex";
import ActionButton from "./ActionButton.vue";

/**
 * Searchbar - single item of a search result topic tree.
 * @module modules/searchBar/components/SearchBarResultListTopicTreeItem
 * @vue-props {Object} searchResult - A single search result.
 * @vue-computed {Boolean} isChecked - Returns true, if layer checkbox is checked.
 */
export default {
    name: "SearchBarResultListTopicTreeItem",
    components: {
        ActionButton
    },
    props: {
        searchResult: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapGetters(["visibleLayerConfigs"]),
        ...mapGetters("Modules/SearchBar", [
            "selectedSearchResults"
        ]),

        /**
         * Returns true, if layer checkbox is checked.
         * @returns {Boolean} true, if layer checkbox is checked
         */
        isChecked () {
            const layerId = this.searchResult.events?.onClick?.activateLayerInTopicTree?.layerId || this.searchResult.events?.onClick?.addLayerToTopicTree?.layerId;

            if (this.visibleLayerConfigs?.find(layer => layer.id === layerId) !== undefined) {
                return true;
            }

            return typeof this.selectedSearchResults.find(item => this.searchResult.id === item.id) !== "undefined";
        },

        /**
         * Returns all actions stored in 'searchResult.events.buttons'.
         * @returns{Object} all actions to execute on click
         */
        actions () {
            return this.searchResult.events.buttons ? this.searchResult.events.buttons : [];
        }
    },
    methods: {
        ...mapActions("Modules/SearchBar", [
            "addLayerToTopicTree", "removeLayerFromTopicTree"
        ]),

        /**
         * Add or remove the layer of searchResult to/from map.
         * @returns {void}
         */
        addOrRemoveLayer () {
            const actionArgs = this.searchResult.events?.onClick?.activateLayerInTopicTree || this.searchResult.events?.onClick?.addLayerToTopicTree;

            if (actionArgs) {
                if (!this.isChecked) {
                    this.addLayerToTopicTree(actionArgs);
                }
                else {
                    this.removeLayerFromTopicTree(actionArgs);
                }
            }
        }

    }
};
</script>

<template lang="html">
    <div
        :id="'search-bar-result-list-topic-tree-item-' + searchResult.id"
        class="d-flex flex-row align-items-center"
    >
        <button
            class="d-flex flex-row p-1 pb-2 align-items-center search-bar-result-list-topic-tree-item-title btn-transparent"
            @click="addOrRemoveLayer"
            @keydown.enter="addOrRemoveLayer"
        >
            <span
                :id="'search-bar-result-list-topic-tree-item-checkbox-' + searchResult.id"
                :class="[
                    'search-bar-result-list-topic-tree-item-checkbox ps-1 pe-3',
                    {
                        'bi-check-square': isChecked,
                        'bi-square': !isChecked
                    }
                ]"
            />
            <span
                :class="['search-bar-result-list-topic-tree-item-label', 'mt-0 d-flex flex-column align-self-start', isChecked ? 'bold' : '']"
                :for="'search-bar-result-list-topic-tree-item-checkbox-' + searchResult.id"
                tabindex="0"
                :aria-label="$t(searchResult.name)"
            >
                <span>
                    {{ $t(searchResult.name) }}
                </span>
            </span>
        </button>
        <div class="ms-auto mt-1 d-flex">
            <div
                v-for="action, i in Object.keys(actions)"
                :key="i"
            >
                <ActionButton
                    :action-name="action"
                    :action-args="actions[action]"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
@import "~mixins";

.search-bar-result-list-topic-tree-item-title, .search-bar-result-list-topic-tree-item-checkbox {
    &:hover {
        @include primary_action_hover;
    }
    &:focus {
        @include primary_action_focus;
    }
}

.search-bar-result-list-topic-tree-item-label {
    cursor: pointer;
}
.btn-transparent {
    background-color: transparent;
    border: none;
    text-align:left;
}
</style>
