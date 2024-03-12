<script>
import {mapActions, mapGetters} from "vuex";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import {Select} from "ol/interaction";
import {dblclick, never} from "ol/events/condition";
/**
 * Abimo
 * @module modules/AbimoMeasure
 */
export default {
    name: "AbimoMeasure",
    data () {
        return {
            features: [],
            sliders: [
                {
                    id: "slider1",
                    label: "Regler 1",
                    value: 0,
                    info: "Info zu Regler 1"
                },
                {
                    id: "slider2",
                    label: "Regler 2",
                    value: 0,
                    info: "Info zu Regler 2"
                },
                {
                    id: "slider3",
                    label: "Regler 3",
                    value: 0,
                    info: "Info zu Regler 3"
                }
            ],
            selectInteraction: null,
            layer: null
        };
    },
    computed: {
        ...mapGetters(["configJs"])
    },
    mounted () {
        this.createInteractions();
        this.layer = mapCollection
            .getMap("2D")
            .getLayers()
            .getArray()
            .find((layer) => layer.get("id") === "planung_abimo");
    },
    methods: {
        ...mapActions("Maps", {
            addInteractionToMap: "addInteraction",
            removeInteractionFromMap: "removeInteraction"
        }),
        /**
         * Creates the interactions for selecting features.
         * @returns {void}
         */
        createInteractions: function () {
            const selectInteraction = new Select({
                condition: dblclick,
                removeCondition: never,
                multi: true,
                layers: function (layer) {
                    return layer.get("id") === "basis_abimo";
                }
            });

            this.selectInteraction = selectInteraction;

            selectInteraction.on("select", (event) => {
                event.selected.forEach((feature) => {
                    this.features.push(feature);
                });
                event.deselected.forEach((feature) => {
                    this.features = this.features.filter(
                        (f) => f.ol_uid !== feature.ol_uid
                    );
                });
            });
            this.addInteractionToMap(selectInteraction);
        },
        measuresToRGB (measure1, measure2, measure3) {
            const red = Math.round((measure1 / 100) * 255),
                green = Math.round((measure2 / 100) * 255),
                blue = Math.round((measure3 / 100) * 255);

            return `rgb(${red},${green},${blue})`;
        },
        createStyle (properties) {
            const rules = [
                    {min: 0, max: 30, color: [108, 245, 66, 1]},
                    {min: 31, max: 60, color: [115, 237, 66, 1]},
                    {min: 61, max: 90, color: [122, 230, 66, 1]},
                    {min: 91, max: 120, color: [129, 222, 66, 1]},
                    {min: 121, max: 150, color: [135, 215, 66, 1]},
                    {min: 151, max: 180, color: [142, 207, 66, 1]},
                    {min: 181, max: 210, color: [149, 199, 66, 1]},
                    {min: 211, max: 240, color: [156, 192, 66, 1]},
                    {min: 241, max: 270, color: [163, 184, 66, 1]},
                    {min: 271, max: 300, color: [170, 177, 66, 1]},
                    {min: 301, max: 330, color: [177, 169, 66, 1]},
                    {min: 331, max: 360, color: [183, 161, 66, 1]},
                    {min: 361, max: 390, color: [190, 154, 66, 1]},
                    {min: 391, max: 420, color: [197, 146, 66, 1]},
                    {min: 421, max: 450, color: [204, 139, 66, 1]},
                    {min: 451, max: 480, color: [211, 131, 66, 1]},
                    {min: 481, max: 510, color: [218, 123, 66, 1]},
                    {min: 511, max: 540, color: [224, 116, 66, 1]},
                    {min: 541, max: 570, color: [231, 108, 66, 1]},
                    {min: 571, max: 600, color: [238, 101, 66, 1]}
                ],
                matchingRule = rules.find(rule => properties.r >= rule.min && properties.r <= rule.max),
                fillColor = matchingRule ? matchingRule.color : [255, 255, 255, 1];

            return new Style({
                stroke: new Stroke({
                    color: this.measuresToRGB(properties.measure1, properties.measure2, properties.measure3),
                    width: 2
                }),
                fill: new Fill({
                    color: fillColor
                })
            });
        },
        showInfo (info) {
            // eslint-disable-next-line no-alert
            alert(info);
        },
        mapToOlFeatures (featuresArray) {
            const sliderValues = this.sliders.map((slider) => slider.value);

            return featuresArray.map((featureData) => {
                const olFeature = new Feature({
                    geometry: featureData.getGeometry(),
                    schl5: featureData.values_.schl5,
                    r: featureData.values_.r,
                    verdunstun: featureData.values_.verdunstun,
                    sonstigeWerte: "Alle Werte, die für Abimo gebraucht werden",
                    row: featureData.values_.row,
                    ri: featureData.values_.ri,
                    regenja: featureData.values_.regenja,
                    measure1: sliderValues[0],
                    measure2: sliderValues[1],
                    measure3: sliderValues[2]
                });

                return olFeature;
            });
        },
        addToLayer (features) {
            const layerSource = this.layer.values_.source;

            layerSource.addFeatures(features);
        },
        logFunctionsAndProperties (obj) {
            const methods = Object.getOwnPropertyNames(obj).filter(
                    (key) => typeof obj[key] === "function"
                ),
                properties = Object.getOwnPropertyNames(obj).filter(
                    (key) => typeof obj[key] !== "function"
                );

            console.warn(methods);
            console.warn(properties);
            console.warn(JSON.stringify(obj));
        },
        async applyMeasures () {
            if (this.features.length) {
                const olFeatures = this.mapToOlFeatures(this.features);

                for (const feature of olFeatures) {
                    const properties = feature.getProperties(),
                        {schl5, r, verdunstun, sonstigeWerte, row, ri, regenja, measure1, measure2, measure3} = properties,
                        payload = {schl5, r, verdunstun, sonstigeWerte, row, ri, regenja, measure1, measure2, measure3};

                    try {
                        const response = await fetch("http://localhost:3000/calculate", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(payload)
                        });

                        if (!response.ok) {
                            throw new Error("Netzwerkantwort war nicht ok.");
                        }

                        // eslint-disable-next-line one-var
                        const updatedProperties = await response.json();

                        feature.setProperties(updatedProperties);
                        feature.setStyle(this.createStyle(updatedProperties));

                    }
                    catch (error) {
                        console.error("Fehler beim Abrufen der Daten:", error);
                    }
                }


                this.addToLayer(olFeatures);
            }
            else {
                console.warn(
                    "Keine Features ausgewählt, Maßnahmen können nicht angewendet werden."
                );
            }
        }
    }
};
</script>

<template lang="html">
    <div id="abimo">
        <div
            v-for="slider in sliders"
            :key="slider.id"
        >
            <label :for="slider.id">{{ slider.label }}</label>
            <input
                :id="slider.id"
                v-model="slider.value"
                type="range"
                min="0"
                max="100"
            >
            <span>{{ slider.value }}</span>
            <button @click="showInfo(slider.info)">
                i
            </button>
        </div>
        <button
            :disabled="!features.length"
            @click="applyMeasures"
        >
            Maßnahmen anwenden
        </button>
        <ul>
            <li
                v-for="feature in features"
                :key="feature.code"
            >
                Code: {{ feature.values_.schl5 }}, R: {{ feature.values_.r }}
            </li>
        </ul>
    </div>
</template>

<style type="scss" scoped>
input[type="range"],
button {
    margin: 5px;
    cursor: pointer;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
}
</style>

