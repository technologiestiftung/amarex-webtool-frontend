<script>
export default {
    name: "ControlBar",
    methods: {
        /**
        * prepares the configured tools to be the right component form
        * @param {Object} configuredControls controls as configured in config.json
        * @returns {void}
        */
        prepareControls (configuredControls) {
            this.$controlAddons?.forEach(controlName => {
                const addonControlConfig = configuredControls[controlName];

                if (addonControlConfig) {
                    if (addonControlConfig.hiddenMobile) {
                        this.mobileHiddenControls.push(controlName);
                    }
                    if (addonControlConfig.expandableControl) {
                        this.expandableControls.push(controlName);
                    }
                }
            }, this);

            // Object
            //     .keys(configuredControls)
            //     .filter(key => configuredControls[key])
            //     .map(key => {
            //         if (this.componentMap[key]) {
            //             return {
            //                 component: this.componentMap[key],
            //                 props: typeof configuredControls[key] === "object" ? configuredControls[key] : {},
            //                 key
            //             };
            //         }
            //         return key;
            //     })
            //     .filter(x => x !== "mousePosition") // "mousePosition" is currently handled in footer
            //     .forEach(c => {
            //         if (this.expandableControls.includes(c.key)) {
            //             this.categorizedControls.expandable.push(c);
            //             if (configuredControls[c.key]?.hiddenMobile === true) {
            //                 this.mobileHiddenControls.push(c.key);
            //             }
            //         }
            //         else {
            //             // defaulting to sidebar
            //             this.categorizedControls.sidebar.push(c);
            //             if (configuredControls[c.key]?.hiddenMobile === true) {
            //                 this.mobileHiddenControls.push(c.key);
            //             }
            //         }
            //     });
        }
    }
};
</script>

<style lang="scss">
    @import "~variables";
    /* using this classname to scope css effects; can not use scoped scss here since controls are not within scope, but added by jQuery */
    .backwards-compatibility-controls {
        /* use old styling way for icons for old controls */
        .bootstrap-icon {
            color: $white;
            background-color: $primary;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }
        > .toggleButtonPressed {
            background-color: $light_blue;
        }
        /* forcing compatibility by overriding old-style layouting */
        .controls-row-right {
            position: relative;
            margin-right: 0;
            min-height: 0;
        }
        .row {
            margin-right: 0;
            margin-left: 0;

            > * {
                padding-right: 0;
                padding-left: 0;
            }
        }
        > div {
            padding: 5px;
            > div {
                margin-top: 0;
            }
        }
    }
</style>
