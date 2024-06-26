<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import RoutingBatchProcessing from "../RoutingBatchProcessing.vue";
import { RoutingTaskHandler } from "../../js/classes/routing-task-handler";

/**
 * DirectionsItemBatchProcessing
 * @module modules/DirectionsItemBatchProcessing
 * @vue-prop {Object} settings - The settings.
 * @vue-data {Boolean} isProcessing - Shows if files are being processed.
 * @vue-data {Number} countFailed - The failed attempts fo get directions.
 */
export default {
  name: "DirectionsItemBatchProcessing",
  components: {
    RoutingBatchProcessing,
  },
  props: {
    settings: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isProcessing: false,
      countFailed: 0,
      serviceRequests: 0,
    };
  },
  computed: {
    ...mapGetters("Modules/Routing", ["taskHandler", "directionsSettings"]),
  },
  methods: {
    ...mapMutations("Modules/Routing/Directions", ["setIsLoadingDirections"]),
    ...mapMutations("Modules/Routing", ["setTaskHandler"]),
    ...mapActions("Modules/Routing/Directions", [
      "fetchDirections",
      "resetRoutingDirectionsResults",
    ]),
    ...mapActions("Alerting", ["addSingleAlert"]),
    /**
     * Called when files are added by the user to process
     * loading animation is shown while processing and an error is shown to the user if something happens while processing
     * @param {File[]} files to process
     * @returns {void}
     */
    addFiles(files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();

        reader.onload = async (f) => {
          this.isProcessing = true;
          this.setTaskHandler(null);
          this.countFailed = 0;
          this.serviceRequests = 0;

          this.resetRoutingDirectionsResults();
          this.setIsLoadingDirections(true);

          try {
            const result = await this.parseCsv(f.target.result);

            if (result) {
              this.downloadResults(file.name, result);
            }
            if (this.countFailed === this.serviceRequests) {
              this.addSingleAlert({
                category: this.$t("common:modules.alerting.categories.error"),
                content: this.$t(
                  "common:modules.routing.directions.batchProcessing.errorAllFailed",
                ),
              });
            } else if (this.countFailed !== 0) {
              this.addSingleAlert({
                category: "error",
                title: this.$t("common:modules.alerting.categories.error"),
                content: this.$t(
                  "common:modules.routing.directions.batchProcessing.errorSomeFailed",
                  { countFailed: this.coundFailed },
                ),
              });
            }
          } catch (e) {
            this.addSingleAlert({
              category: "error",
              title: this.$t("common:modules.alerting.categories.error"),
              content: e.message,
            });
          }

          this.setIsLoadingDirections(false);
          this.countFailed = 0;
          this.isProcessing = false;
          this.setTaskHandler(null);
        };

        reader.readAsText(file);
      });
    },
    /**
     * Creates a csv from the objects
     * @param {Object[]} downloadObjects resulting objects from the processing per row
     * @returns {String} csv string
     */
    createCsvToDownload(downloadObjects) {
      if (
        !Array.isArray(downloadObjects) ||
        typeof downloadObjects[0] !== "object" ||
        downloadObjects[0] === null
      ) {
        return "";
      }
      return (
        Object.keys(downloadObjects[0]).join(";") +
        "\n" +
        downloadObjects.map((obj) => Object.values(obj).join(";")).join("\n")
      );
    },
    /**
     * Starts a download for the user to get the result from the process
     * @param {String} filename for the resulting file
     * @param {Object[]} downloadObjects resulting objects from the processing per row
     * @returns {void}
     */
    async downloadResults(filename, downloadObjects) {
      const csv = this.createCsvToDownload(downloadObjects),
        downloadFilename = this.createDownloadFilename(filename);

      if (typeof navigator.msSaveOrOpenBlob === "function") {
        window.navigator.msSaveOrOpenBlob(
          new Blob(["\ufeff", csv], {
            type: "text/csv;charset=utf-8,%EF%BB%BF",
          }),
          downloadFilename,
        );
      } else {
        const url = `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`,
          a = document.createElement("a");

        a.href = url;
        a.download = downloadFilename;
        a.style.visibility = "hidden";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    },
    /**
     * Converts the input filename to a csv filename
     * @param {String} filename for the resulting file
     * @returns {String} new csv filename
     */
    createDownloadFilename(filename) {
      if (typeof filename !== "string") {
        return ".csv";
      }
      const parts = filename.split("."),
        partsWithoutExtension = parts.slice(0, parts.length - 1);

      return partsWithoutExtension.join(".") + ".csv";
    },
    /**
     * Parses the csv content to tasks and checks for input errors
     * @param {String} filecontent to parse
     * @returns {Promise<Object[]>} the results from the tasks per row
     */
    parseCsv(filecontent) {
      return new Promise((resolve, reject) => {
        if (typeof filecontent !== "string") {
          reject(
            new Error(
              this.$t(
                "common:modules.routing.directions.batchProcessing.errorNoEntries",
              ),
            ),
          );
          return;
        }
        const content = filecontent.replace(/[\r]/g, "").trim(),
          lines = content.split("\n"),
          count = lines.length,
          tasks = [];

        if (content.length === 0 || count === 0) {
          reject(
            new Error(
              this.$t(
                "common:modules.routing.directions.batchProcessing.errorNoEntries",
              ),
            ),
          );
          return;
        }
        if (
          this.settings.batchProcessing.limit &&
          count > this.settings.batchProcessing.limit
        ) {
          reject(
            new Error(
              this.$t(
                "common:modules.routing.directions.batchProcessing.errorToManyEntriesInFile",
                { limit: this.settings.batchProcessing.limit },
              ),
            ),
          );
          return;
        }

        for (let i = 0; i < count; i++) {
          const line = lines[i],
            lineParts = line.split(";");

          if (lineParts.length === 1 && lineParts.includes("")) {
            continue;
          }

          if (lineParts.length !== 5) {
            reject(
              new Error(
                this.$t(
                  "common:modules.routing.directions.batchProcessing.errorToManyEntriesInRow",
                  { row: i },
                ),
              ),
            );
            return;
          }

          if (
            !this.isNumber(Number(lineParts[1])) ||
            !this.isNumber(Number(lineParts[2])) ||
            !this.isNumber(Number(lineParts[3])) ||
            !this.isNumber(Number(lineParts[4]))
          ) {
            reject(
              new Error(
                this.$t(
                  "common:modules.routing.directions.batchProcessing.errorRowContainsEntriesNoNumber",
                  { row: i },
                ),
              ),
            );
            return;
          }

          tasks.push(() => this.parseLineParts(lineParts));
        }

        this.setTaskHandler(
          new RoutingTaskHandler(
            tasks,
            this.settings.batchProcessing.maximumConcurrentRequests
              ? this.settings.batchProcessing.maximumConcurrentRequests
              : this.$store.getters["Modules/Routing/Directions/settings"]
                  .batchProcessing.maximumConcurrentRequests,
            (allResults, newResult) => allResults.push(newResult),
            (results) => resolve(results),
          ),
        );
      });
    },
    /**
     * Parses one csv row and requests the directions to get the time and distance
     * @param {String[]} lineParts to parse
     * @returns {Promise<Object>} the result from the task
     */
    async parseLineParts(lineParts) {
      const id = lineParts[0],
        startLon = Number(lineParts[1]),
        startLat = Number(lineParts[2]),
        endeLon = Number(lineParts[3]),
        endeLat = Number(lineParts[4]),
        result = {
          ID: id,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.xStart",
          )]: startLon,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.yStart",
          )]: startLat,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.xEnd",
          )]: endeLon,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.yEnd",
          )]: endeLat,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.time",
          )]: null,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.distance",
          )]: null,
          [this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.profile",
          )]: this.settings.speedProfile,
        };

      try {
        this.serviceRequests += 1;
        const directionsResult = await this.fetchDirections({
          wgs84Coords: [
            [startLon, startLat],
            [endeLon, endeLat],
          ],
          instructions: false,
        });

        result[
          this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.distance",
          )
        ] = directionsResult.distance.toFixed(2);
        result[
          this.$t(
            "common:modules.routing.directions.batchProcessing.downloadHeader.time",
          )
        ] = (directionsResult.duration / 60).toFixed(2);
      } catch (error) {
        this.countFailed = this.countFailed + 1;
      }
      return result;
    },
    /**
     * Checks if input is a number
     * @param {*} num to check
     * @returns {Boolean} true if number
     */
    isNumber(num) {
      return !isNaN(num) && typeof num === "number";
    },
  },
};
</script>

<template>
  <RoutingBatchProcessing
    :settings="settings"
    :progress="taskHandler ? taskHandler.progress : 0"
    :is-processing="isProcessing"
    :structure-text="
      $t('common:modules.routing.directions.batchProcessing.structure')
    "
    example-text="1;8.12;50.67;9.12;51.67"
    @filesadded="addFiles($event)"
    @cancel-process="taskHandler.cancelRun()"
  />
</template>
