<script>

/**
 * Tool to check if a subset of features associated to a target layer are located within or outside an applied radius to all features of a source layer.
 */
export default {
    name: "BufferAnalysis",
    
    mounted () {
        this.$nextTick(() => {
            this.applyValuesFromSavedUrlBuffer();
        });
    }
};
</script>
