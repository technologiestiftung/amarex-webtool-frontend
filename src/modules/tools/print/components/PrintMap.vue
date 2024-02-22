<script>
import isObject from "../../../../utils/isObject";
import {getComponent} from "../../../../utils/getComponent";
import BuildSpec from "../utils/buildSpec";
import getVisibleLayer from "../utils/getVisibleLayer";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";

/**
 * Tool to print a part of the map
 */
export default {
    name: "PrintMap",

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * sets listener to laylerlist.
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);

        // warn if deprecated param is used
        if (this.mapfishServiceId) {
            console.warn("Print Tool: The parameter 'mapfishServiceId' is deprecated in the next major release! Please use printServiceId instead.");
        }

        // this.setServiceId(this.mapfishServiceId && this.mapfishServiceId !== "" ? this.mapfishServiceId : this.printServiceId);

        Backbone.Events.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": () => {
                if (typeof this.eventListener !== "undefined") {
                    getVisibleLayer(this.printMapMarker);
                    this.updateCanvasLayer();
                    this.updateCanvasByFeaturesLoadend(this.visibleLayerList);
                }
            }
        });
    },

    methods: {
        /**
         * Selcts the gfi
         * @param {event} evt the click event
         * @returns {void}
         */
        selectGfi (evt) {
            this.setIsGfiSelected = evt.target.checked;
        },

        /**
         * Sets active to false.
         * @param {event} event the click event
         * @returns {void}
         */
        close (event) {
            event.stopPropagation();
            this.setActive(false);

            const model = getComponent(this.$store.state.Tools.Print.id);

            if (model) {
                model.set("isActive", false);
            }
        },

        /**
         * Checks if the layout has a certain attribute by its name.
         * @param {Object} layout - The selected layout.
         * @param {String} attributeName - The name of the attribute to be checked.
         * @returns {Boolean} True if it has otherwise false.
         */
        hasLayoutAttribute (layout, attributeName) {
            if (isObject(layout) && typeof attributeName === "string" && this.printService !== "plotservice") {
                return layout.attributes.some(attribute => {
                    return attribute.name === attributeName;
                });
            }
            return false;
        },
        /**
         * Gets the layout attributes by the given names.
         * @param {Object} layout - The selected layout.
         * @param {String[]} nameList - A list of attribute names.
         * @returns {Object} The layout attributes or an empty object.
         */
        getLayoutAttributes (layout, nameList) {
            const layoutAttributes = {};

            if (!isObject(layout) || !Array.isArray(nameList)) {
                return layoutAttributes;
            }
            nameList.forEach(name => {
                if (this.hasLayoutAttribute(layout, name)) {
                    if (name === "overviewMap") {
                        layoutAttributes[name] = {
                            "layers": [BuildSpec.buildTileWms(this.getLayerById({layerId: this.getOverviewmapLayerId()}), this.dpiForPdf)]
                        };
                    }
                    else if (name === "source") {
                        layoutAttributes[name] = [];
                        this.visibleLayerList.forEach(layer => {
                            const foundRawLayer = rawLayerList.getLayerWhere({id: layer.get("id")});

                            if (foundRawLayer) {
                                layoutAttributes[name].push(foundRawLayer?.datasets[0].show_doc_url + foundRawLayer.datasets[0].md_id);
                            }
                        });
                        layoutAttributes[name] = layoutAttributes[name].join("\n");
                    }
                    else {
                        layoutAttributes[name] = this[name];
                    }
                }
            });

            return layoutAttributes;
        }
    }
};
</script>

