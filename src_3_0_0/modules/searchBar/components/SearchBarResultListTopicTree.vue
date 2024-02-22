<script>
import {mapGetters} from "vuex";
import SearchBarResultListTopicTreeItem from "./SearchBarResultListTopicTreeItem.vue";

/**
 * Searchbar result list to show search results for topic tree.
 * @module modules/searchBar/components/SearchBarResultListTopicTree
 * @vue-props {Object[]} resultItems - The result items.
 */
export default {
    name: "SearchBarResultListTopicTree",
    components: {
        SearchBarResultListTopicTreeItem
    },
    props: {
        resultItems: {
            type: Array,
            required: true
        }
    },
    computed: {
        ...mapGetters("Modules/SearchBar", [
            "searchInput",
            "searchResults",
            "selectedSearchResults"
        ])
    }
};
</script>

<template lang="html">
    <div class="overflow-auto results-topic-tree-container">
        <div
            v-for="(item, index) in resultItems"
            :key="item.id + '-' + index"
        >
            <span :id="'searchInputLi' + index">
                <SearchBarResultListTopicTreeItem
                    :search-result="item"
                />
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>
