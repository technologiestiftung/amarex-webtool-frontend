<script>
import isObject from "../../../shared/js/utils/isObject";
import { translateKeyWithPlausibilityCheck } from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";
import { getDefaultOperatorBySnippetType } from "../utils/getDefaultOperatorBySnippetType.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SnippetInfo from "./SnippetInfo.vue";

dayjs.extend(customParseFormat);

/**
 * Snippet Date Range
 * @module modules/SnippetDateRange
 * @vue-prop {Array} adjustment - The changes made by other snippets that change settings in this snippet. E.g. one snippet changes to "Grundschulen" and other snippets change their min value as a result of the adjustment.
 * @vue-prop {Object} api - The api.
 * @vue-prop {String} attrName - The title and aria label.
 * @vue-prop {Boolean} disabled - Shows if snippet is disabled.
 * @vue-prop {String} display - Sets which dates should be displayed.
 * @vue-prop {Number} filterId - The filter's id.
 * @vue-prop {Array} fixedRules - List of fixed rules.
 * @vue-prop {String} format - The date format.
 * @vue-prop {Array} info - The information for the SnippetInfo.
 * @vue-prop {Boolean} isParent - Shows if element is a parent element.
 * @vue-prop {String} operator - (???).
 * @vue-prop {String} prechecked - (???).
 * @vue-prop {Number} snippetId - The snippet's id.
 * @vue-prop {Array} subTitles - The subtitles for the from and until date.
 * @vue-prop {Number} timeoutSlider - The timeout for the slider.
 * @vue-prop {Array} title - The label.
 * @vue-prop {String} value - The value for a date.
 * @vue-prop {Boolean} visible - Shows if snippet is visible.
 *
 * @vue-data {Number} sliderFrom - (???).
 * @vue-data {Number} sliderUntil - (???).
 * @vue-data {Number} currentSliderMin - The current slider minimum.
 * @vue-data {Number} currentSliderMax - The current slider maximum.
 *
 * @vue-event {Object} changeRule - Emits the current rule to whoever is listening.
 * @vue-event {Number} deleteRule - Emits the delete rule function to whoever is listening.
 * @vue-event {Number} disableFilterButton - Emits disable filter button function to whoever is listening.
 * @vue-event {Number} enableFilterButton - Emits enable filter button function to whoever is listening.
 * @vue-event {*} setSnippetPrechecked - Emits the setSnippetPrechecked event.
 */
export default {
  name: "SnippetDateRange",
  components: {
    SnippetInfo,
  },
  props: {
    adjustment: {
      type: [Object, Boolean],
      required: false,
      default: false,
    },
    api: {
      type: Object,
      required: false,
      default: null,
    },
    attrName: {
      type: [String, Array],
      required: false,
      default: "",
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    display: {
      type: String,
      required: false,
      default: "all",
    },
    filterId: {
      type: Number,
      required: false,
      default: 0,
    },
    filterGeometry: {
      type: [Object, Boolean],
      required: false,
      default: false,
    },
    filterGeometryName: {
      type: [String, Boolean],
      required: false,
      default: false,
    },
    fixedRules: {
      type: Array,
      required: false,
      default: () => {
        return [];
      },
    },
    format: {
      type: [String, Array],
      required: false,
      default: "YYYY-MM-DD",
    },
    info: {
      type: [String, Boolean],
      required: false,
      default: false,
    },
    isParent: {
      type: Boolean,
      required: false,
      default: false,
    },
    operator: {
      type: String,
      required: false,
      default: undefined,
    },
    operatorForAttrName: {
      type: String,
      required: false,
      default: "AND",
    },
    prechecked: {
      type: Array,
      required: false,
      default: undefined,
    },
    snippetId: {
      type: Number,
      required: false,
      default: 0,
    },
    subTitles: {
      type: [Array, Boolean],
      required: false,
      default: false,
    },
    timeoutSlider: {
      type: Number,
      required: false,
      default: 800,
    },
    title: {
      type: [String, Boolean],
      required: false,
      default: true,
    },
    value: {
      type: Array,
      required: false,
      default: undefined,
    },
    visible: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  emits: [
    "changeRule",
    "deleteRule",
    "disableFilterButton",
    "enableFilterButton",
    "setSnippetPrechecked",
  ],
  data() {
    return {
      sliderFrom: -1,
      sliderUntil: -1,
      currentSliderMin: -1,
      currentSliderMax: -1,
      visibleDatepicker: false,
      initialDateRef: [],
    };
  },
  computed: {
    dateFromComputed: {
      get() {
        return this.initialDateRef[this.sliderFrom]
          ? this.initialDateRef[this.sliderFrom]
          : this.initialDateRef[0];
      },
      set(date) {
        this.sliderFrom = this.getSliderIdxCloseToFromDate(date);
      },
    },
    dateUntilComputed: {
      get() {
        return this.initialDateRef[this.sliderUntil]
          ? this.initialDateRef[this.sliderUntil]
          : this.initialDateRef[this.initialDateRef.length - 1];
      },
      set(date) {
        this.sliderUntil = this.getSliderIdxCloseToUntilDate(date);
      },
    },
    dateMinComputed() {
      return this.initialDateRef[this.currentSliderMin]
        ? this.initialDateRef[this.currentSliderMin]
        : this.initialDateRef[0];
    },
    dateMaxComputed() {
      return this.initialDateRef[this.currentSliderMax]
        ? this.initialDateRef[this.currentSliderMax]
        : this.initialDateRef[this.initialDateRef.length - 1];
    },
  },
  watch: {
    adjustment(adjusting) {
      if (!isObject(adjusting) || this.visible === false || this.isParent) {
        return;
      }
      this.$nextTick(() => {
        const mindayjs = dayjs(
            adjusting?.adjust?.min,
            this.getFormat("from"),
            true,
          ),
          maxdayjs = dayjs(
            adjusting?.adjust?.max,
            this.getFormat("until"),
            true,
          );

        if (adjusting.start) {
          this.isAdjusting = true;
          this.adjustMinMax = [];
        }

        if (
          mindayjs.isValid() &&
          (typeof this.adjustMinMax[0] === "undefined" ||
            this.adjustMinMax[0].isBefore(mindayjs))
        ) {
          this.adjustMinMax[0] = mindayjs;
        }
        if (
          maxdayjs.isValid() &&
          (typeof this.adjustMinMax[1] === "undefined" ||
            this.adjustMinMax[1].isAfter(maxdayjs))
        ) {
          this.adjustMinMax[1] = maxdayjs;
        }

        if (adjusting.finish) {
          if (!this.isSelfSnippetId(adjusting?.snippetId)) {
            this.currentSliderMin =
              typeof this.adjustMinMax[0] !== "undefined"
                ? this.getSliderIdxCloseToFromDate(
                    this.adjustMinMax[0].format(this.internalFormat),
                  )
                : 0;
            this.currentSliderMax =
              typeof this.adjustMinMax[1] !== "undefined"
                ? this.getSliderIdxCloseToUntilDate(
                    this.adjustMinMax[1].format(this.internalFormat),
                  )
                : this.initialDateRef.length - 1;
            if (!this.hasRuleSet || this.currentSliderMin > this.sliderFrom) {
              this.sliderFrom = this.currentSliderMin;
            }
            if (!this.hasRuleSet || this.currentSliderMax < this.sliderUntil) {
              this.sliderUntil = this.currentSliderMax;
            }
          }

          this.$nextTick(() => {
            this.isAdjusting = false;
            if (Array.isArray(this.prechecked)) {
              const sliderFrom = this.getSliderIdxCloseToFromDate(
                  this.prechecked[0],
                ),
                sliderUntil = this.getSliderIdxCloseToUntilDate(
                  this.prechecked[1],
                );

              if (this.currentSliderMin > sliderFrom) {
                this.sliderFrom = this.currentSliderMin;
              }
              if (this.currentSliderMax < sliderUntil) {
                this.sliderUntil = this.currentSliderMax;
              }
            }
          });
        }
      });
    },
    sliderFrom(val) {
      if (parseInt(val, 10) > parseInt(this.sliderUntil, 10)) {
        this.sliderUntil = val;
      } else if (!this.isInitializing && !this.isAdjusting) {
        this.emitCurrentRule([
          dayjs(
            this.initialDateRef[this.sliderFrom],
            this.internalFormat,
          ).format(this.getFormat("from")),
          dayjs(
            this.initialDateRef[this.sliderUntil],
            this.internalFormat,
          ).format(this.getFormat("until")),
        ]);
      }
    },
    sliderUntil(val) {
      if (parseInt(val, 10) < parseInt(this.sliderFrom, 10)) {
        this.sliderFrom = val;
      } else if (!this.isInitializing && !this.isAdjusting) {
        this.emitCurrentRule([
          dayjs(
            this.initialDateRef[this.sliderFrom],
            this.internalFormat,
          ).format(this.getFormat("from")),
          dayjs(
            this.initialDateRef[this.sliderUntil],
            this.internalFormat,
          ).format(this.getFormat("until")),
        ]);
      }
    },
  },
  created() {
    this.isInitializing = true;
    this.isAdjusting = false;
    this.hasRuleSet = false;
    this.adjustMinMax = [];
    this.internalFormat = "YYYY-MM-DD";
    this.intvEmitCurrentRule = -1;
    this.sliderMouseDown = false;
    this.operatorWhitelist = ["BETWEEN", "INTERSECTS"];
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isPrecheckedValid(this.prechecked)) {
        this.emitCurrentRule(this.prechecked, true, true);
      }
      if (this.operatorForAttrName !== "OR") {
        this.visibleDatepicker = true;
      }
      if (
        Array.isArray(this.attrName) &&
        typeof this.operatorForAttrName === "string" &&
        this.operatorForAttrName === "OR"
      ) {
        const promises = [];

        this.attrName.forEach((v) => {
          const promise = new Promise((resolve, reject) => {
            this.getValueListFromApi(
              v,
              (list) => {
                resolve(list);
              },
              (error) => reject(error),
            );
          });

          promises.push(promise);
        });
        Promise.allSettled(promises).then((results) => {
          const arrErr = [],
            concatList = [];

          results.forEach((result) => {
            if (result.status === "fulfilled") {
              concatList.push(...result.value);
            } else {
              arrErr.push(result.reason);
            }
          });
          this.initSlider(concatList);
          this.$nextTick(() => {
            this.isInitializing = false;
            this.emitSnippetPrechecked(
              this.prechecked,
              this.snippetId,
              this.visible,
            );
            this.visibleDatepicker = true;
          });
        });
      } else if (Array.isArray(this.attrName) && this.attrName.length === 2) {
        this.$nextTick(() => {
          this.getValueListFromApi(
            this.attrName[0],
            (listFrom) => {
              this.getValueListFromApi(
                this.attrName[1],
                (listUntil) => {
                  this.initSlider(listFrom, listUntil);
                  this.$nextTick(() => {
                    this.emitSnippetPrechecked(this.snippetId, this.visible);
                  });
                },
                (error) => {
                  this.emitSnippetPrechecked();
                  console.warn(error);
                },
              );
            },
            (error) => {
              this.emitSnippetPrechecked();
              console.warn(error);
            },
          );
        });
      } else if (typeof this.attrName === "string" && this.attrName) {
        this.$nextTick(() => {
          this.getValueListFromApi(
            this.attrName,
            (list) => {
              this.initSlider(list);
              this.$nextTick(() => {
                this.emitSnippetPrechecked(this.snippetId, this.visible);
              });
            },
            (error) => {
              this.emitSnippetPrechecked();
              console.warn(error);
            },
          );
        });
      }
    });
  },
  methods: {
    translateKeyWithPlausibilityCheck,

    /**
     * Emits the setSnippetPrechecked event.
     * @param {Number} snippetId The snippet id to emit.
     * @param {Boolean} visible true if the snippet is visible, false if not.
     * @returns {void}
     */
    emitSnippetPrechecked(snippetId, visible) {
      this.$emit(
        "setSnippetPrechecked",
        visible && this.isPrecheckedValid(this.prechecked) ? snippetId : false,
      );
    },
    /**
     * Initializes the slider with the given value lists.
     * @param {String[]} listFrom A sorted list of start dates.
     * @param {String[]} [listUntil=undefined] A sorted list of end dates.
     * @returns {void}
     */
    initSlider(listFrom, listUntil = undefined) {
      this.initialDateRef = this.getInitialDateReference(listFrom, listUntil);
      this.currentSliderMin = 0;
      this.currentSliderMax = this.initialDateRef.length - 1;

      this.$nextTick(() => {
        if (this.isPrecheckedValid(this.prechecked)) {
          this.sliderFrom = this.getSliderIdxCloseToFromDate(
            dayjs(this.prechecked[0], this.getFormat("from")).format(
              this.internalFormat,
            ),
          );
          this.sliderUntil = this.getSliderIdxCloseToUntilDate(
            dayjs(this.prechecked[1], this.getFormat("until")).format(
              this.internalFormat,
            ),
          );
        } else {
          this.sliderFrom = this.currentSliderMin;
          this.sliderUntil = this.currentSliderMax;
        }
        this.$nextTick(() => {
          this.isInitializing = false;
        });
      });
    },
    /**
     * Returns the title to use for this snippet.
     * @returns {String} The title to use.
     */
    getTitle() {
      if (typeof this.title === "string") {
        return this.title;
      } else if (this.title === true) {
        return this.getAttrNameFrom();
      }
      return "";
    },
    /**
     * Returns the subtitle to use for from.
     * @returns {String} The subtitle to use.
     */
    getSubTitleFrom() {
      if (Array.isArray(this.subTitles) && this.subTitles.length === 2) {
        return this.subTitles[0];
      }
      return this.getAttrNameFrom();
    },
    /**
     * Returns the subtitle to use for until.
     * @returns {String} The subtitle to use.
     */
    getSubTitleUntil() {
      if (Array.isArray(this.subTitles) && this.subTitles.length === 2) {
        return this.subTitles[1];
      } else if (Array.isArray(this.attrName) && this.attrName.length === 2) {
        return this.attrName[1];
      }
      return "";
    },
    /**
     * Returns the title to be used by the SnippetTag representing this snippet.
     * @returns {String} The tagTitle to use.
     */
    getTagTitle() {
      if (
        typeof this.dateFromComputed === "undefined" &&
        typeof this.dateUntilComputed === "undefined"
      ) {
        return this.prechecked[0] + " - " + this.prechecked[1];
      }
      return (
        dayjs(this.dateFromComputed, this.internalFormat).format(
          this.getFormat("from"),
        ) +
        " - " +
        dayjs(this.dateUntilComputed, this.internalFormat).format(
          this.getFormat("until"),
        )
      );
    },
    /**
     * Returns the riskless attrName to use for from.
     * @returns {String} The attrName to use for from.
     */
    getAttrNameFrom() {
      if (Array.isArray(this.attrName) && this.attrName.length === 2) {
        return this.attrName[0];
      }
      return this.attrName;
    },
    /**
     * Returns the riskless attrName to use for until.
     * @returns {String} The attrName to use for until.
     */
    getAttrNameUntil() {
      if (Array.isArray(this.attrName) && this.attrName.length === 2) {
        return this.attrName[1];
      }
      return this.attrName;
    },
    /**
     * Returns the slider index equal or close to untilDate in an upward direction.
     * @param {String} fromDate The until from in internal format.
     * @returns {Number} The index equal or close to.
     */
    getSliderIdxCloseToFromDate(fromDate) {
      const len = this.initialDateRef.length;

      if (!fromDate) {
        return 0;
      }
      for (let i = 0; i < len; i++) {
        if (this.initialDateRef[i] >= fromDate) {
          return i;
        }
      }
      return len - 1;
    },
    /**
     * Returns the slider index equal or close to untilDate in a downward direction.
     * @param {String} untilDate The until date in internal format.
     * @returns {Number} The index equal or close to.
     */
    getSliderIdxCloseToUntilDate(untilDate) {
      const len = this.initialDateRef.length - 1;

      if (!untilDate) {
        return len;
      }
      for (let i = len; i >= 0; i--) {
        if (this.initialDateRef[i] <= untilDate) {
          return i;
        }
      }
      return 0;
    },
    /**
     * Receives unique value of api.
     * @param {String} attrName The attrName to receive data for.
     * @param {Function} onsuccess A function(value) with value the received list.
     * @param {Function} onerror A function(error) to receive errors with.
     * @returns {void}
     */
    getValueListFromApi(attrName, onsuccess, onerror) {
      if (typeof this.api?.getUniqueValues !== "function") {
        return;
      }
      this.api.getUniqueValues(
        attrName,
        (value) => {
          if (typeof onsuccess === "function") {
            onsuccess(value);
          }
        },
        onerror,
        {
          rules: this.fixedRules,
          filterId: this.filterId,
          commands: {
            filterGeometry: this.filterGeometry,
            geometryName: this.filterGeometryName,
          },
        },
      );
    },
    /**
     * Merges given lists into one, sorted by time, removes doublings.
     * @param {String[]} listFrom A list to draw string dates from.
     * @param {String[]} listUntil A secondary list to draw string dates from.
     * @returns {String[]} A list of date entries following internal format, sorted and without doublings.
     */
    getInitialDateReference(listFrom, listUntil) {
      const result = [],
        displayAssoc = {},
        unixAssoc = {},
        formatFrom = this.getFormat("from"),
        formatUntil = this.getFormat("until"),
        minMoment = dayjs(
          Array.isArray(this.value) ? this.value[0] : undefined,
          formatFrom,
        ),
        minValid = minMoment.isValid(),
        maxMoment = dayjs(
          Array.isArray(this.value) ? this.value[1] : undefined,
          formatUntil,
        ),
        maxValid = maxMoment.isValid();

      this.addListToUnixAssoc(
        listFrom,
        formatFrom,
        minValid,
        maxValid,
        minMoment,
        maxMoment,
        unixAssoc,
      );
      this.addListToUnixAssoc(
        listUntil,
        formatUntil,
        minValid,
        maxValid,
        minMoment,
        maxMoment,
        unixAssoc,
      );

      Object.values(this.sortResultByTime(unixAssoc)).forEach((dayjsDate) => {
        const key = dayjsDate.format(this.internalFormat);

        if (!Object.prototype.hasOwnProperty.call(displayAssoc, key)) {
          result.push(key);
          displayAssoc[key] = true;
        }
      });
      return result;
    },
    /**
     * Sort given List by Time
     * @param {Object} obj A list of objects with unix-timestamps as keys.
     * @returns {Object} A list sorted by time.
     */
    sortResultByTime(obj) {
      const list = Object.keys(obj).sort((a, b) => a - b),
        sortedResult = {};

      list.forEach(function (v, i) {
        sortedResult[i] = obj[v];
      });
      return sortedResult;
    },
    /**
     * Adds all entries of list into result, that are recognized and between given min and max dayjs.
     * @param {String[]} list A list of string dates to check and add.
     * @param {String} format The format to translate entries of list into date with.
     * @param {Boolean} minValid true if the given mindayjs is a valid date.
     * @param {Boolean} maxValid true if the given maxdayjs is a valid date.
     * @param {Object} mindayjs The lower boundary as dayjs.
     * @param {Object} maxdayjs The higher boundary as dayjs.
     * @param {Object} result The reference to the result object.
     * @returns {Boolean} true if result was altered, false if something went wrong.
     */
    addListToUnixAssoc(
      list,
      format,
      minValid,
      maxValid,
      mindayjs,
      maxdayjs,
      result,
    ) {
      if (
        !Array.isArray(list) ||
        typeof format !== "string" ||
        typeof minValid !== "boolean" ||
        typeof maxValid !== "boolean" ||
        typeof mindayjs?.isValid !== "function" ||
        typeof maxdayjs?.isValid !== "function" ||
        !isObject(result)
      ) {
        return false;
      }
      list.forEach((rawDate) => {
        const momentDate = dayjs(rawDate, format);

        if (
          !momentDate.isValid() ||
          (minValid && momentDate.isBefore(mindayjs)) ||
          (maxValid && momentDate.isAfter(maxdayjs))
        ) {
          return;
        }
        result[momentDate.unix()] = momentDate;
      });
      return true;
    },
    /**
     * Returns the format, free of risks.
     * @param {String} what If format should be returned for 'from' or 'until'.
     * @returns {String} The set format for what.
     */
    getFormat(what) {
      if (typeof this.format === "string") {
        return this.format;
      } else if (!Array.isArray(this.format) || this.format.length !== 2) {
        return this.internalFormat;
      } else if (what === "from") {
        return this.format[0];
      }
      return this.format[1];
    },
    /**
     * Returns the operator, free of risks.
     * @returns {String} The set operator of if not possible the default operator.
     */
    getOperator() {
      if (!this.operatorWhitelist.includes(this.operator)) {
        return getDefaultOperatorBySnippetType("dateRange");
      }
      return this.operator;
    },
    /**
     * Checks if the prechecked value is valid.
     * @param {String[]} prechecked The prechecked value.
     * @returns {Boolean} true if the prechecked value is valid, false if not.
     */
    isPrecheckedValid(prechecked) {
      return (
        Array.isArray(prechecked) &&
        prechecked.length === 2 &&
        dayjs(prechecked[0], this.getFormat("from"), true).isValid() &&
        dayjs(prechecked[1], this.getFormat("until"), true).isValid()
      );
    },
    /**
     * Returns true if the given snippetId equals - or if an array, holds - the own snippetId.
     * @param {Number|Number[]} snippetId The snippetId to check or an array of snippetIds to search through.
     * @returns {Boolean} true if this is the own snippetId or param contains the own snippetId, false if not.
     */
    isSelfSnippetId(snippetId) {
      if (Array.isArray(snippetId)) {
        return snippetId.includes(this.snippetId);
      }
      return snippetId === this.snippetId;
    },
    /**
     * Calculates the position of the left slider button in percent.
     * @info a 5% offset is calculated in to compensate for button width
     * @returns {String} the percentage to use for css left style
     */
    getMeasureLeft() {
      const range = this.currentSliderMax - this.currentSliderMin,
        left = this.sliderFrom - this.currentSliderMin;

      return String(((95 / Math.max(1, range)) * left).toFixed(1)) + "%";
    },
    /**
     * Calculates the distance between both slider buttons in percent.
     * @info a 5% offset is calculated in to compensate for button width
     * @returns {String} the percentage to use for css width style
     */
    getMeasureWidth() {
      const range = this.currentSliderMax - this.currentSliderMin,
        measure = this.sliderUntil - this.sliderFrom;

      return String(((95 / Math.max(1, range)) * measure + 5).toFixed(1)) + "%";
    },
    /**
     * Emits the current rule to whoever is listening.
     * @param {*} value the value to put into the rule
     * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
     * @param {Boolean} [immediate=false] true if emit should be at once, false if soft waiting period should be applied
     * @returns {void}
     */
    emitCurrentRule(value, startup = false, immediate = false) {
      if (immediate) {
        this.changeRule(value, startup);
        return;
      }
      this.$emit("disableFilterButton");
      clearTimeout(this.intvEmitCurrentRule);
      this.intvEmitCurrentRule = setTimeout(() => {
        if (!this.sliderMouseDown) {
          this.changeRule(value, startup);
          this.$emit("enableFilterButton");
        }
      }, this.timeoutSlider);
    },
    /**
     * Emits the current rule to whoever is listening.
     * @param {*} value the value to put into the rule
     * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
     * @returns {void}
     */
    changeRule(value, startup = false) {
      this.hasRuleSet = true;
      this.$emit("changeRule", {
        snippetId: this.snippetId,
        startup,
        fixed: !this.visible,
        attrName: this.attrName,
        operatorForAttrName: this.operatorForAttrName,
        operator: this.getOperator(),
        format: this.format,
        value,
        tagTitle: this.getTagTitle(),
      });
    },
    /**
     * Emits the delete rule function to whoever is listening.
     * @returns {void}
     */
    deleteCurrentRule() {
      this.hasRuleSet = false;
      this.$emit("deleteRule", this.snippetId);
    },
    /**
     * Resets the values of this snippet.
     * @param {Function} onsuccess the function to call on success
     * @returns {void}
     */
    resetSnippet(onsuccess) {
      this.isAdjusting = true;
      if (this.visible) {
        this.hasRuleSet = false;
        this.sliderFrom = this.currentSliderMin;
        this.sliderUntil = this.currentSliderMax;
      }
      this.$nextTick(() => {
        if (typeof onsuccess === "function") {
          onsuccess();
        }
        this.isAdjusting = false;
      });
    },
    /**
     * Sets flag if mouse is down on slider.
     * @returns {void}
     */
    setSliderMouseDown() {
      this.sliderMouseDown = true;
    },
    /**
     * Sets flag if mouse is up after down on slider.
     * @returns {void}
     */
    setSliderMouseUp() {
      this.sliderMouseDown = false;
      if (!this.isInitializing && !this.isAdjusting) {
        this.emitCurrentRule([
          dayjs(
            this.initialDateRef[this.sliderFrom],
            this.internalFormat,
          ).format(this.getFormat("from")),
          dayjs(
            this.initialDateRef[this.sliderUntil],
            this.internalFormat,
          ).format(this.getFormat("until")),
        ]);
      }
    },
  },
};
</script>

<template>
  <div
    v-show="visible"
    class="snippetDateRangeContainer"
  >
    <div
      v-if="title || info"
      class="titleWrapper"
    >
      <div
        v-if="title"
        class="title"
      >
        {{ translateKeyWithPlausibilityCheck(getTitle(), (key) => $t(key)) }}
      </div>
      <div
        v-if="info"
        class="info"
      >
        <SnippetInfo
          :info="info"
          translation-key="snippetDateRange"
        />
      </div>
    </div>
    <div
      v-if="display === 'all' || display === 'datepicker'"
      class="datepickerWrapper"
    >
      <div v-if="visibleDatepicker === true">
        <div class="from">
          <label
            v-if="subTitles"
            :for="'inputDateRangeFrom-' + snippetId"
          >
            {{
              translateKeyWithPlausibilityCheck(getSubTitleFrom(), (key) =>
                $t(key),
              )
            }}
          </label>
          <input
            :id="'inputDateRangeFrom-' + snippetId"
            v-model="dateFromComputed"
            type="date"
            :min="dateMinComputed"
            :max="dateMaxComputed"
            :aria-label="
              $t('common:modules.filter.ariaLabel.dateRange.from', {
                param: getAttrNameFrom(),
              })
            "
            :disabled="disabled"
          />
        </div>
        <div class="until">
          <label
            v-if="subTitles"
            :for="'inputDateRangeUntil-' + snippetId"
          >
            {{
              translateKeyWithPlausibilityCheck(getSubTitleUntil(), (key) =>
                $t(key),
              )
            }}
          </label>
          <input
            :id="'inputDateRangeUntil-' + snippetId"
            v-model="dateUntilComputed"
            type="date"
            :min="dateMinComputed"
            :max="dateMaxComputed"
            :aria-label="
              $t('common:modules.filter.ariaLabel.dateRange.to', {
                param: getAttrNameUntil(),
              })
            "
            :disabled="disabled"
          />
        </div>
      </div>
    </div>
    <div
      v-if="display === 'all' || display === 'slider'"
      class="sliderWrapper"
    >
      <div class="track">
        <div
          class="measure"
          :style="{ left: getMeasureLeft(), width: getMeasureWidth() }"
        />
      </div>
      <input
        v-model="sliderFrom"
        type="range"
        :aria-label="
          $t('common:modules.filter.ariaLabel.sliderRange.min', {
            param: getAttrNameFrom(),
          })
        "
        class="from"
        :disabled="disabled"
        :min="currentSliderMin"
        :max="currentSliderMax"
        @mousedown="setSliderMouseDown"
        @mouseup="setSliderMouseUp"
      />
      <input
        v-model="sliderUntil"
        type="range"
        :aria-label="
          $t('common:modules.filter.ariaLabel.sliderRange.max', {
            param: getAttrNameUntil(),
          })
        "
        class="until"
        :disabled="disabled"
        :min="currentSliderMin"
        :max="currentSliderMax"
        @mousedown="setSliderMouseDown"
        @mouseup="setSliderMouseUp"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~mixins";

.snippetDateRangeContainer {
  height: auto;

  .titleWrapper {
    position: relative;
    height: 16px;
    .title {
      position: absolute;
      left: 0;
      width: 90%;
    }
    .info {
      position: absolute;
      right: 0;
    }
  }
  .datepickerWrapper {
    position: relative;
    margin-top: 5px;
    height: 38px;
    .from {
      position: absolute;
      left: 0;
      width: 50%;

      label {
        display: block;
        height: 18px;
      }
      input {
        width: 90%;
      }
    }
    .until {
      position: absolute;
      right: 0;
      width: 50%;
      text-align: right;

      label {
        display: block;
        height: 18px;
      }
      input {
        width: 90%;
      }
    }
  }
  .sliderWrapper {
    position: relative;
    margin-top: 5px;
    height: 28px;
    .track {
      width: 100%;
      height: 15px;
      background-color: $light_grey;
      position: absolute;
      margin: auto;
      top: 0;
      bottom: 0;
      border-radius: 10px;
    }
    .measure {
      height: 15px;
      background-color: $light_blue;
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 10px;
    }

    input[type="range"] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 100%;
      outline: none;
      position: absolute;
      margin: auto;
      top: 0;
      bottom: 1px;
      left: 0;
      background-color: transparent;
      pointer-events: none;
    }
    input[type="range"]:focus {
      outline: none;
    }
    input[type="range"]::-webkit-slider-runnable-track {
      -webkit-appearance: none;
      height: 3px;
      width: 100%;
      cursor: pointer;
      border-radius: 1px;
      box-shadow: none;
    }
    input[type="range"]::-moz-range-track {
      -moz-appearance: none;
      height: 3px;
    }
    input[type="range"]::-ms-track {
      appearance: none;
      height: 3px;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 15px;
      width: 15px;
      background-color: $white;
      cursor: pointer;
      border-radius: 10px;
      pointer-events: auto;
      margin-top: -5px;
      z-index: 2;
    }
    input[type="range"]::-moz-range-thumb {
      -appearance: none;
      height: 15px;
      width: 15px;
      background-color: $white;
      cursor: pointer;
      border-radius: 50%;
      pointer-events: auto;
    }
    input[type="range"]::-ms-thumb {
      -appearance: none;
      height: 15px;
      width: 15px;
      background-color: $white;
      cursor: pointer;
      border-radius: 50%;
      pointer-events: auto;
    }
    input[type="range"]:active::-ms-thumb {
      background-color: $white;
      border: 1px solid $light_blue;
    }
    input[type="range"]:active::-moz-range-thumb {
      background-color: $white;
      border: 1px solid $light_blue;
    }
    input[type="range"]:active::-webkit-slider-thumb {
      background-color: $white;
      border: 1px solid $light_blue;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    span {
      &.min {
        float: left;
        position: absolute;
        left: 0;
        top: 48px;
      }
      &.max {
        float: right;
        position: absolute;
        right: 0;
        top: 48px;
      }
    }
    input[type="range"].disabled::-webkit-slider-thumb {
      background-color: $light_grey;
    }
  }
}
</style>
