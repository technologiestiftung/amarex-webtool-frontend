<script>

export default {
    name: "FileImport",
    methods: {
        /**
         * opens the draw tool, closes fileImport
         * @pre fileImport is opened
         * @post fileImport is closed, the draw tool is opened
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @returns {void}
         */
        openDrawTool () {
            // todo: to select the correct tool in the menu, for now Radio request is used
            const drawToolModel = Radio.request("ModelList", "getModelByAttributes", {id: "draw"});

            // todo: change menu highlighting - this will also close the current tool:
            drawToolModel.collection.setActiveToolsToFalse(drawToolModel);
            drawToolModel.setIsActive(true);

            this.close();
            this.$store.dispatch("Tools/Draw/toggleInteraction", "modify");
            this.$store.dispatch("Tools/setToolActive", {id: "draw", active: true});
        }
    }
};
</script>

<template lang="html">
    
</template>

<style lang="scss" scoped>
</style>
