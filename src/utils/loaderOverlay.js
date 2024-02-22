/**
 * Handles Loader Overlay.
 */
export default {
    loaderOverlayCount: 0, // this is needed to handle multiple loader show calls
    initialLoaderIsHidden: false,
    loaderTimeoutReference: null,
    /**
     * Shows Loader Overlay.
     * @param {number}     maxWait - Maximum loader duration
     * @returns {number}           - Count of virtual loader stacks
     */
    show: function (maxWait = 25000) {
        const loader = document.getElementById("loader"),
            masterportalContainer = document.getElementById("masterportal-container");

        clearTimeout(this.loaderTimeoutReference);
        this.loaderTimeoutReference = setTimeout(() => {
            this.hide();
        }, maxWait);

        if (loader !== null) {
            document.getElementById("loader").classList.add("loader-is-loading");
        }
        if (masterportalContainer !== null && this.initialLoaderIsHidden) {
            document.getElementById("masterportal-container").classList.add("blurry");
        }

        return ++this.loaderOverlayCount;
    }
};
