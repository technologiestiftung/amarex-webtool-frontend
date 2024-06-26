<script>
import { mapActions, mapGetters } from "vuex";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Select } from "ol/interaction";
import { dblclick, never } from "ol/events/condition";
/**
 * Abimo
 * @module modules/AbimoMeasure
 */
export default {
  name: "AbimoMeasure",
  data() {
    return {
      features: [],
      sliders: [
        {
          id: "slider1",
          label: "Versickerungsmulde",
          value: 0,
        },
        {
          id: "slider2",
          label: "Gründach",
          value: 0,
        },
        {
          id: "slider3",
          label: "Rigolen",
          value: 0,
        },
      ],
      selectInteraction: null,
      layer: null,
    };
  },
  computed: {
    ...mapGetters(["configJs"]),
  },
  mounted() {
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
      removeInteractionFromMap: "removeInteraction",
    }),
    /**
     * Creates the interactions for selecting features.
     * @returns {void}
     */
    createInteractions: function () {
      // From open layers we imported the Select class. This adds the possibility to add "blocks" to our feature layer. For further info check OpenLayers Docs
      const selectInteraction = new Select({
        condition: dblclick,
        removeCondition: never,
        multi: true,
        layers: function (layer) {
          return layer.get("id") === "abimo_2020_wfs";
        },
      });

      // Add the interaction to the components methods
      this.selectInteraction = selectInteraction;

      // Checks for condition "is selected" and adds/removes the feature accordingly
      selectInteraction.on("select", (event) => {
        event.selected.forEach((feature) => {
          this.features.push(feature);
        });
        event.deselected.forEach((feature) => {
          this.features = this.features.filter(
            (f) => f.ol_uid !== feature.ol_uid,
          );
        });
      });
      // registers interaction in module - check masterportal docu
      this.addInteractionToMap(selectInteraction);
    },
    measuresToRGB(measure1, measure2, measure3) {
      const red = Math.round((measure1 / 100) * 255),
        green = Math.round((measure2 / 100) * 255),
        blue = Math.round((measure3 / 100) * 255);

      return `rgb(${red},${green},${blue})`;
    },
    createStyle(properties) {
      // This function transform importet geodata, in this case our ROW to a hard coded colour code.

      const rules = [
          { min: 0, max: 1, color: [108, 245, 66, 1] },
          { min: 1, max: 50, color: [115, 237, 66, 1] },
          { min: 50, max: 100, color: [122, 230, 66, 1] },
          { min: 100, max: 150, color: [129, 222, 66, 1] },
          { min: 150, max: 200, color: [135, 215, 66, 1] },
          { min: 200, max: 250, color: [142, 207, 66, 1] },
          { min: 250, max: 300, color: [149, 199, 66, 1] },
          { min: 300, max: 350, color: [156, 192, 66, 1] },
          { min: 350, max: 400, color: [163, 184, 66, 1] },
        ],
        matchingRule = rules.find(
          (rule) => properties.row >= rule.min && properties.row <= rule.max,
        ),
        fillColor = matchingRule ? matchingRule.color : [255, 14, 14, 1];

      return new Style({
        stroke: new Stroke({
          color: this.measuresToRGB(
            properties.measure1,
            properties.measure2,
            properties.measure3,
          ),
          width: 2,
        }),
        fill: new Fill({
          color: fillColor,
        }),
      });
    },
    mapToolFeatures(featuresArray) {
      const sliderValues = this.sliders.map((slider) => slider.value);

      return featuresArray.map((featureData) => {
        //copies the equivalent feature from the selection (data.features), creates a new Feature object from the OpenLayers class and adds further properties within the object
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
          measure3: sliderValues[2],
        });

        return olFeature;
      });
    },
    addToLayer(features) {
      this.layer.values_.source.addFeatures(features);
    },
    logFunctionsAndProperties(obj) {
      const methods = Object.getOwnPropertyNames(obj).filter(
          (key) => typeof obj[key] === "function",
        ),
        properties = Object.getOwnPropertyNames(obj).filter(
          (key) => typeof obj[key] !== "function",
        );

      console.warn(methods);
      console.warn(properties);
      console.warn(JSON.stringify(obj));
    },
    calculatePercentages(feature) {
      const evaporation = Math.floor(parseFloat(feature.values_.verdunstun));
      const rinse = Math.floor(parseFloat(feature.values_.ri));
      const runoff = Math.floor(parseFloat(feature.values_.row));

      const total = evaporation + rinse + runoff;

      const evaporationPercentage = (evaporation / total) * 100 - 0.5;
      const rinsePercentage = (rinse / total) * 100 - 0.5;
      const runoffPercentage = (runoff / total) * 100 - 0.5;

      return {
        evaporationPercentage,
        rinsePercentage,
        runoffPercentage,
      };
    },
    async applyMeasures() {
      // adds the former created OL-Features to the "Planung Abimo" layer
      const olFeatures = this.mapToolFeatures(this.features);

      for (const feature of olFeatures) {
        const properties = feature.getProperties();
        const payload = { ...properties };

        try {
          const response = await fetch(
            //TODO: This is a dummy server. Is this running within this repo or is it hosted seperately?
            "http://localhost:3000/calculate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            },
          );

          if (!response.ok) {
            throw new Error("Netzwerkantwort war nicht ok.");
          }

          // eslint-disable-next-line one-var
          const updatedProperties = await response.json();

          feature.setProperties(updatedProperties);
          feature.setStyle(this.createStyle(updatedProperties));
        } catch (error) {
          console.error("Fehler beim Abrufen der Daten:", error);
        }
      }

      this.addToLayer(olFeatures);
    },
  },
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
      />
      <span>{{ slider.value }}</span>
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
        class="feature-details"
      >
        <ul>
          <li>
            <strong>CODE: {{ feature.values_.code }}</strong>
          </li>
          <li>
            Fläche:
            {{ Number(feature.values_.flaeche).toFixed(2) }}m2
          </li>
          <li style="display: flex">
            <div class="bar-1 label" />
            Verdunstung:
            {{ Number(feature.values_.verdunstun).toFixed(2) }}mm
          </li>
          <li style="display: flex">
            <div class="bar-2 label" />
            Versickerung:
            {{ Number(feature.values_.ri).toFixed(2) }}mm
          </li>
          <li style="display: flex">
            <div class="bar-3 label" />
            Oberflächenabfluss:
            {{ Number(feature.values_.row).toFixed(2) }}mm
          </li>
          <div class="bar-scale">
            <div
              class="bar bar-1"
              :style="{
                width: calculatePercentages(feature).verdunstunPercentage + '%',
              }"
            />
            <div
              class="bar bar-2"
              :style="{
                width: calculatePercentages(feature).riPercentage + '%',
              }"
            />

            <div
              class="bar bar-3"
              :style="{
                width: calculatePercentages(feature).rowPercentage + '%',
              }"
            />
          </div>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
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
.feature-details {
  margin-top: 16px;
  border-top: 1px solid rgb(125, 210, 214);
  padding-top: 16px;
}

.bar-scale {
  min-width: 290px;
  height: 16px;
  display: flex;
}
.bar {
  position: relative;
  height: 100%;
}

.bar-1 {
  background-color: #ff0000;
}

.bar-2 {
  background-color: #00ff00;
}

.bar-3 {
  background-color: #0000ff;
}

.label {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
</style>

