<script>
import { mapActions, mapGetters } from "vuex";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { Select } from "ol/interaction";
import { dblclick, never } from "ol/events/condition";
import AbimoAccordion from "./AbimoAccordion.vue";

/**
 * Abimo
 * @module modules/AbimoMeasure
 */
export default {
  name: "AbimoMeasure",
  components: {
    AbimoAccordion,
  },
  data() {
    return {
      features: [],
      accumulatedAbimoStats: {
        featuresSelected: 0,
        totalArea: 0,
        averageEvaporation: 0,
        averageSwale: 0,
        averageRinse: 0,
      },
      sliders: [
        {
          id: "green_roof",
          label: "Dachbegrünung",
          value: 0,
        },
        {
          id: "to_swale",
          label: "Versickerungsmulde",
          value: 0,
        },
        {
          id: "not_pvd",
          label: "Unversiegelte Fläche",
          value: 0,
        },
      ],
      selectInteraction: null,
      layer: null,
      steps: [
        {
          id: 1,
          label: "Vorberechnete Modelle",
          description:
            "Zur Status Quo Analyse können Sie mit den vorberechneten Karten aus dem Kartenkatalog starten",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Zum Katalog",
              isDisabled: false,
            },
            {
              id: 2,
              label: "Überspringen",
              isDisabled: false,
            },
          ],
        },
        {
          id: 2,
          label: "Untersuchungsgebiet Definieren",
          description:
            "Wählen Sie in der Karte die Blockteilflächen via Mausklick aus, die Sie untersuchen möchten.",
          isActive: true,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: false,
            },
          ],
        },
        {
          id: 3,
          label: "Klimaszenario wählen",
          description:
            "Wählen Sie das Referenyszenario für die Berechnungen aus, weitere Informationen zu den Referenzszenarios finden Sie in unserer Dokumentation.",
          isActive: false,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 4,
          label: "Maßnahmen auswählen",
          description:
            "Wählen Sie anteilsmäßig die Maßnahmen, die Sie in die Berechnung einfließen lassen wollen.",
          isActive: true,
          buttons: [
            {
              id: 1,
              label: "Bestätigen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 5,
          label: "Berechnung",
          description:
            "Fügen Sie nun den berechneten DeltaW-Layer hinzu. Des Weiteren stehen ihnen weitere Ergebnislayer zur Verfügung.",
          isActive: true,
          buttons: [
            {
              id: 1,
              label: "Layer Einfügen",
              isDisabled: true,
            },
          ],
        },
        {
          id: 6,
          label: "Weitere Berechnung",
          description:
            "Wenn Sie weitere Berchnungen mit veränderten Parametern vornehmen möchten, klicken Sie hier auf Neu Berechnen.",
          isActive: true,
          buttons: [
            {
              id: 1,
              label: "Neu Berechnen",
              isDisabled: true,
            },
          ],
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["configJs"]),
  },
  mounted() {
    this.createInteractions();
    this.layer_abimo_altered = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "planung_abimo");

    this.layer_rabimo_input = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "rabimo_input_2020");

    this.layer_abimo_results = mapCollection
      .getMap("2D")
      .getLayers()
      .getArray()
      .find((layer) => layer.get("id") === "abimo_2020_wfs");

    console.log("PRECALC", this.layer_abimo_results);
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

      // Checks for condition "is selected" loads data from abimo and rabimo_input and creates a merged feature out of them
      selectInteraction.on("select", (event) => {
        console.log("select, (event)", event.selected);

        event.selected.forEach((feature) => {
          const featureCode = feature.values_.code;
          const inputFeature = this.getInputFeature(featureCode);
          console.log("[AbimoMeasure] inputFeature::", inputFeature);
          // console.log("Abimo_Input", this.layer_rabimo_input.values_);
          this.adjustSliders(inputFeature);

          // something is not working here, it doesn't create a Feature
          const mergedFeatures = {
            ...feature,
            values_: { ...feature.values_, ...inputFeature },
          };
          this.features.push(mergedFeatures);
        });

        this.accumulatedAbimoStats = {
          featuresSelected: this.features.length,
          totalArea: this.features
            .map((f) => Number(f.values_.area))
            .reduce((a, b) => a + b, 0),
          averageEvaporation:
            this.features
              .map((f) => Number(f.values_.evaporatio))
              .reduce((a, b) => a + b, 0) / this.features.length,
          averageSwale:
            this.features
              .map((f) => Number(f.values_.infiltrati))
              .reduce((a, b) => a + b, 0) / this.features.length,
          averageRinse:
            this.features
              .map((f) => Number(f.values_.surface_ru))
              .reduce((a, b) => a + b, 0) / this.features.length,
        };

        event.deselected.forEach((feature) => {
          this.features = this.features.filter(
            (f) => f.ol_uid !== feature.ol_uid,
          );
        });
      });
      // registers interaction in module - check masterportal docu
      this.addInteractionToMap(selectInteraction);
    },
    getInputFeature(featureCode) {
      // features are stored in an Object IDed with numbers. This function returns each ID in an array to iterate over them
      const featureKeys = Object.keys(
        this.layer_rabimo_input.values_.source.featuresRtree_.items_,
      );

      // This function returns the featureKey with the same code
      const equivalentFeatureKey = featureKeys.find(
        (key) =>
          this.layer_rabimo_input.values_.source.featuresRtree_.items_[key]
            .value.values_.code === featureCode,
      );
      return this.layer_rabimo_input.values_.source.featuresRtree_.items_[
        equivalentFeatureKey
      ].value.values_;
    },
    adjustSliders(feature) {
      console.log("adjustSliders(feature)", feature);
      this.sliders[0].value = Number(feature.green_roof).toFixed(2) * 100;
      this.sliders[1].value = Number(feature.to_swale).toFixed(2) * 100;
      this.sliders[2].value = Number((1 - feature.pvd).toFixed(2) * 100);
    },
    measuresToRGB(measure1, measure2, measure3) {
      const red = Math.round((measure1 / 100) * 255),
        green = Math.round((measure2 / 100) * 255),
        blue = Math.round((measure3 / 100) * 255);

      return `rgb(${red},${green},${blue})`;
    },
    createStyle(properties) {
      // This function transform importet geodata, in this case our Evaporatio to a hard coded colour code.

      const rules = [
        { min: 0, max: 70, color: [255, 0, 0, 1] },
        { min: 71, max: 140, color: [226, 28, 0, 1] },
        { min: 141, max: 210, color: [198, 56, 0, 1] },
        { min: 211, max: 280, color: [170, 85, 0, 1] },
        { min: 281, max: 350, color: [141, 113, 0, 1] },
        { min: 351, max: 420, color: [113, 142, 0, 1] },
        { min: 421, max: 490, color: [85, 170, 0, 1] },
        { min: 491, max: 560, color: [56, 199, 0, 1] },
        { min: 561, max: 630, color: [28, 227, 0, 1] },
        { min: 631, max: 3000, color: [0, 255, 0, 1] },
      ];

      (matchingRule = rules.find(
        (rule) => properties.row >= rule.min && properties.row <= rule.max,
      )),
        (fillColor = matchingRule ? matchingRule.color : [255, 14, 14, 1]);

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

      console.log("[AbimoMeasure] featuresArray::", featuresArray);

      return featuresArray.map((featureData) => {
        const new_green_roof = sliderValues[0] / 100;
        const new_to_swale = sliderValues[1] / 100;
        const new_pvd = 1 - sliderValues[2] / 100;
        console.log(
          "Greenroof",
          new_green_roof,
          "PVD",
          new_pvd,
          "Swale",
          new_to_swale,
        );
        console.log("this.features[0]", this.features[0]);
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
      this.layer_abimo_altered.values_.source.addFeatures(features);
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

    <AbimoAccordion
      :steps="steps"
      @toggle-step="toggleStep"
    >
      <template v-slot:default="slotProps">
        <div v-if="slotProps.step.id === 1">
          <div
            v-for="button in slotProps.step.buttons"
            :key="button.id"
          >
            <button
              class="btn btn-primary"
              :disabled="button.isDisabled"
            >
              {{ button.label }}
            </button>
          </div>
        </div>

        <div v-else-if="slotProps.step.id === 2">
          <div
            v-for="button in slotProps.step.buttons"
            :key="button.id"
          >
            <button
              class="btn btn-primary"
              :disabled="button.isDisabled"
            >
              {{ button.label }}
            </button>
          </div>
        </div>

        <div v-else-if="slotProps.step.id === 4">
          <!-- Dynamischer Inhalt für Maßnahmen -->

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
            class="btn btn-primary"
            :disabled="!features.length"
            @click="applyMeasures"
          >
            Maßnahmen anwenden
          </button>

          <ul>
            <li
              class="summary"
              v-if="features.length"
            >
              <strong
                >Ausgewählte Flächen:
                {{ accumulatedAbimoStats.featuresSelected }}</strong
              >
              <br />
              <strong
                >Gesamtfläche:
                {{ (accumulatedAbimoStats.totalArea / 1000000).toFixed(2) }}
                km2</strong
              >
              <br />
              <strong
                >Durchschnittliche Verdunstung:
                {{ accumulatedAbimoStats.averageEvaporation.toFixed(2) }}
                mm</strong
              >
              <br />
              <strong
                >Durchschnittliche Versickerung:
                {{ accumulatedAbimoStats.averageRinse.toFixed(2) }} mm</strong
              >
              <br />
              <strong
                >Durchschnittlicher Ablauf:
                {{ accumulatedAbimoStats.averageSwale.toFixed(2) }} mm</strong
              >
            </li>
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
                  {{ Number(feature.values_.area).toFixed(2) }} m2
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
                      width:
                        calculatePercentages(feature).verdunstunPercentage +
                        '%',
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
          <!-- NOTE:END Step 4 -->
        </div>

        <!-- Weitere Steps -->
      </template>
    </AbimoAccordion>
  </div>
</template>

<style lang="scss" scoped>
input[type="range"],
ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
}
.feature-details,
.summary {
  margin-top: 16px;
  border-top: 1px solid #54bba8;
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

