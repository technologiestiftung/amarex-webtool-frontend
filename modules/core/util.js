import LoaderOverlay from "../../src/utils/loaderOverlay";
import findWhereJs from "../../src/utils/findWhereJs";
import isMobile from "../../src/utils/isMobile";
import uniqueId from "../../src/utils/uniqueId";
import {isAny, isAndroid, isApple, isOpera, isWindows} from "../../src/utils/isAny";
import getMasterPortalVersionNumber from "../../src/utils/getMasterPortalVersionNumber";
import uiStyle from "../../src/utils/uiStyle";
import {sort} from "../../src/utils/sort";
import isInternetExplorer from "../../src/utils/isInternetExplorer";

const Util = Backbone.Model.extend(/** @lends Util.prototype */{
    defaults: {
        config: "",
        ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
        loaderOverlayTimeoutReference: null,
        loaderOverlayTimeout: 40,
        // the loaderOverlayCounter has to be set to 1 initialy, because it is shown on start and hidden at the end of app.js
        loaderOverlayCounter: 1,
        fadeOut: 2000
    },
    /**
     * @class Util
     * @extends Backbone.Model
     * @memberof Core
     * @constructs
     * @property {String} config="" todo
     * @property {String[]} ignoredKeys=["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"] List of ignored attribute names when displaying attribute information of all layer types.
     * @property {String} loaderOverlayTimeoutReference=null todo
     * @property {String} loaderOverlayTimeout="20" Timeout for the loadergif.
     * @listens Core#RadioRequestUtilIsViewMobile
     * @listens Core#RadioRequestUtilIsInternetExplorer
     * @listens Core#RadioRequestUtilGetIgnoredKeys
     * @listens Core#RadioRequestUtilRenameKeys
     * @listens Core#RadioRequestUtilRenameValues
     * @listens Core#RadioRequestUtilDifferenceJs
     * @listens Core#RadioRequestUtilSortBy
     * @listens Core#RadioTriggerUtilHideLoader
     * @listens Core#RadioTriggerUtilShowLoader
     * @listens Core#event:changeIsViewMobile
     * @fires Core#RadioTriggerIsViewMobileChanged
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioTriggerUtilHideLoader
     */
    initialize: function () {
        const channel = Radio.channel("Util");

        channel.reply({
            "isViewMobile": function () {
                return this.get("isViewMobile");
            },
            "getMasterPortalVersionNumber": getMasterPortalVersionNumber,
            "isApple": isApple,
            "isAndroid": isAndroid,
            "isOpera": isOpera,
            "isWindows": isWindows,
            "isChrome": this.isChrome,
            "isAny": isAny,
            "getUiStyle": uiStyle.getUiStyle,
            "getIgnoredKeys": function () {
                return this.get("ignoredKeys");
            },
            "sort": sort,
            "isInternetExplorer": isInternetExplorer,
            "convertArrayElementsToString": this.convertArrayElementsToString,
            "renameValues": this.renameValues,
            "pickKeyValuePairs": this.pickKeyValuePairs,
            "groupBy": this.groupBy,
            "sortBy": this.sortBy,
            "uniqueId": uniqueId,
            "pick": this.pick,
            "omit": this.omit,
            "findWhereJs": this.findWhereJs,
            "whereJs": this.whereJs,
            "isEqual": this.isEqual,
            "differenceJs": this.differenceJs,
            "toObject": this.toObject,
            "isEmpty": this.isEmpty,
            "searchNestedObject": this.searchNestedObject
        }, this);

        channel.on({
            "hideLoader": this.hideLoader,
            "refreshTree": this.refreshTree,
            "showLoader": this.showLoader,
            "setUiStyle": uiStyle.setUiStyle
        }, this);

        // initial isMobileView setzen
        this.toggleIsViewMobile();

        this.listenTo(this, {
            "change:isViewMobile": function () {
                channel.trigger("isViewMobileChanged", this.get("isViewMobile"));
            }
        });

        $(window).on("resize", this.toggleIsViewMobile.bind(this));
    },

    /**
     * This sort function sorts arrays, objects and strings. This is a replacement for underscores sortBy
     * @param {(Array|Object|String)} [list=undefined] the array, object or string to sort
     * @param {(String|Number|Function)} [iteratee=undefined] may be a function (value, key, list) returning a number to sort by or the name of the key to sort objects with
     * @param {Object} [context=undefined] the context to be used for iteratee, if iteratee is a function
     * @returns {Array}  a new list as array
     */
    sortBy: function (list, iteratee, context) {
        let sortArray = list,
            mapToSort = [];

        if (sortArray === null || typeof sortArray !== "object" && typeof sortArray !== "string") {
            return [];
        }

        if (typeof sortArray === "string") {
            sortArray = sortArray.split("");
        }

        if (typeof iteratee !== "function") {
            if (!Array.isArray(sortArray)) {
                sortArray = Object.values(sortArray);
            }

            // it is important to work with concat() on a copy of sortArray
            return sortArray.concat().sort((a, b) => {
                if (a === undefined) {
                    return 1;
                }
                else if (b === undefined) {
                    return -1;
                }
                else if (iteratee !== undefined) {
                    if (typeof a !== "object" || !Object.prototype.hasOwnProperty.call(a, iteratee)) {
                        return 1;
                    }
                    else if (typeof b !== "object" || !Object.prototype.hasOwnProperty.call(b, iteratee)) {
                        return -1;
                    }
                    else if (a[iteratee] > b[iteratee]) {
                        return 1;
                    }
                    else if (a[iteratee] < b[iteratee]) {
                        return -1;
                    }

                    return 0;
                }
                else if (a > b) {
                    return 1;
                }
                else if (a < b) {
                    return -1;
                }

                return 0;
            });
        }

        if (!Array.isArray(sortArray)) {
            let key;

            for (key in sortArray) {
                mapToSort.push({
                    idx: iteratee.call(context, sortArray[key], key, list),
                    obj: sortArray[key]
                });
            }
        }
        else {
            mapToSort = sortArray.map((value, key) => {
                return {
                    idx: iteratee.call(context, value, key, list),
                    obj: value
                };
            }, context);
        }

        mapToSort.sort((a, b) => {
            if (a.idx > b.idx) {
                return 1;
            }
            else if (a.idx < b.idx) {
                return -1;
            }

            return 0;
        });

        return mapToSort.map((value) => {
            return value.obj;
        });
    },

    /**
     * Searches the userAgent for the string chrome.
     * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
     * @deprecated in 3.0.0
     */
    isChrome: function () {
        let isChrome = false;

        if ((/Chrome/i).test(navigator.userAgent)) {
            isChrome = true;
        }
        return isChrome;
    },

    /**
     * shows the loader gif
     * @fires Core#RadioTriggerUtilHideLoader
     * @returns {void}
     */
    showLoader: function () {
        LoaderOverlay.show();
    },

    /**
     * hides the loder gif until the timeout has expired
     * @returns {void}
     */
    hideLoader: function () {
        LoaderOverlay.hide();
    },

    /**
     * Setter for attribute isViewMobile
     * @param {boolean} value visibility
     * @return {void}
     */
    setIsViewMobile: function (value) {
        this.set("isViewMobile", value);
    },

    /**
     * Toggled the isViewMobile attribute when the window width exceeds or falls below 768px
     * @return {void}
     */
    toggleIsViewMobile: function () {
        if (!isMobile()) {
            this.setIsViewMobile(false);
        }
        else {
            this.setIsViewMobile(true);
        }
    },

    /**
     * recursively replaces the names of object values with the values provided.
     * @param {object} valuesMap - values mapping object
     * @param {object} obj - the original object
     * @returns {object} the renamed object
     */
    renameValues: function (valuesMap, obj) {
        return Object.keys(obj).reduce((acc, key) => {
            if (obj[key]) {
                if (obj[key].constructor === Object) {
                    return {
                        ...acc,
                        ...{[key]: this.renameValues(valuesMap, obj[key])}
                    };
                }
            }
            return {
                ...acc,
                ...{[key]: valuesMap[obj[key]] || obj[key]}
            };
        },
        {});
    },

    /**
     * picks the key-value pairs corresponding to the given keys from an object.
     * @param {object} obj - the original object
     * @param {string[]} keys - the given keys to be returned
     * @returns {object} the picked object
     */
    pickKeyValuePairs: function (obj, keys) {
        const result = {};

        keys.forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = obj[key];
            }
        });

        return result;
    },

    /**
     * Groups the elements of an array based on the given function.
     * Use Array.prototype.map() to map the values of an array to a function or property name.
     * Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
     * @param {array} [arr=[]] - elements to group
     * @param {function} [fn=null] - reducer function
     * @returns {object} - the grouped object
     */
    groupBy: function (arr = [], fn = null) {
        return arr.map(typeof fn === "function" ? fn : val => val[fn]).reduce((acc, val, i) => {
            acc[val] = (acc[val] || []).concat(arr[i]);
            return acc;
        }, {});
    },

    /**
     * sets the loaderOverlayCounter to a specific number
     * @param {Integer} value the value to set the loaderOverlayCounter to
     * @returns {Void}  -
     */
    setLoaderOverlayCounter: function (value) {
        this.set("loaderOverlayCounter", value);
    },

    /**
     * increments the loaderOverlayCounter
     * @pre the loaderOverlayCounter is n
     * @post the loaderOverlayCounter is n + 1
     * @returns {Void}  -
     */
    incLoaderOverlayCounter: function () {
        this.setLoaderOverlayCounter(this.get("loaderOverlayCounter") + 1);
    },

    /**
     * decrements the loaderOverlayCounter
     * @pre the loaderOverlayCounter is n
     * @post the loaderOverlayCounter is n - 1
     * @returns {Void}  -
     */
    decLoaderOverlayCounter: function () {
        this.setLoaderOverlayCounter(this.get("loaderOverlayCounter") - 1);
    },
    /**
     * Refresh LayerTree dependant on TreeType
     * supports light and custom
     * @returns {void}
     */
    refreshTree: () => {
        let collection = null;

        switch (Radio.request("Parser", "getTreeType")) {
            case "classic":
                collection = Radio.request("ModelList", "getCollection");

                collection.trigger("updateClassicTree");
                break;
            case "light":
                Radio.trigger("ModelList", "refreshLightTree");
                break;
            default:
                Radio.trigger("ModelList", "renderTree");
        }
    },

    /**
     * Return a copy of the object, filtered to only have values for the whitelisted keys
     * (or array of valid keys).
     * @param {Object} object - the object.
     * @param {Number[]|String[]} keys - the key(s) to search for.
     * @returns {Object} - returns the entry/entries with the right key/keys.
     */
    pick: function (object, keys) {
        return keys.reduce((obj, key) => {
            if (object && Object.prototype.hasOwnProperty.call(object, key)) {
                obj[key] = object[key];
            }
            return obj;
        }, {});
    },

    /**
     * Returns a copy of the object, filtered to omit the keys specified
     * (or array of blacklisted keys).
     * @param {Object} object - The object.
     * @param {Number[]|String[]|Boolean[]} blacklist - Blacklisted keys.
     * @returns {Object} - returns the entry/entries without the blacklisted key/keys.
     */
    omit: function (object, blacklist) {
        const keys = Object.keys(object ? object : {}),
            blacklistWithStrings = this.convertArrayElementsToString(blacklist),
            filteredKeys = keys.filter(key => !blacklistWithStrings.includes(key)),
            filteredObj = filteredKeys.reduce((result, key) => {
                result[key] = object[key];
                return result;
            }, {});

        return filteredObj;
    },

    /**
     * Converts elements of an array to strings.
     * @param {Number[]|String[]|Boolean[]} [array=[]] - Array with elements.
     * @returns {String[]} Array with elements as string.
     */
    convertArrayElementsToString: function (array = []) {
        const arrayWithStrings = [];

        for (const element of array) {
            arrayWithStrings.push(String(element));
        }
        return arrayWithStrings;
    },

    /**
     * Looks through the given list and returns the first value that matches all of the key value pairs of properties.
     * @param {Object[]} list A list of objects to look through.
     * @param {Object} properties An object to match with all key value pairs.
     * @returns {Object} Returns the first object in list which matches all given properties.
     */
    findWhereJs: function (list = [], properties = "") {
        return findWhereJs(list, properties);
    },

    /**
     *  Looks through each value in the list, returning an array of all the values that matches the key-value pairs listed in properties
     * @param {Object[]} [list=[]] - the list.
     * @param {Object} properties property/entry to search for.
     * @returns {array} - returns an array of all the values that matches.
     */
    whereJs: function (list = [], properties = "") {
        return list.filter(
            item => Object.keys(properties).every(
                key => item[key] === properties[key]
            )
        );
    },

    /**
     * Looks through each value in the array a, returning an array of all the values that are not present in the array b
     * @param {array} [a=[]] - elements to check
     * @param {array} [b=[]] - elements to check
     * @returns {array} - returns diffrence between array a and b
     */
    differenceJs: function (a = [], b = []) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0) {
            return [];
        }
        if (b.length === 0) {
            return a;
        }
        return a.filter(e => !b.includes(e));
    },

    /**
     * Check if two objects are same
     * @param {Object} first the first object
     * @param {Object} second the second object
     * @returns {Boolean} true or false
     */
    isEqual: function (first, second) {
        // If the value of either variable is empty, we can instantly compare them and check for equality.
        if (first === null || first === undefined || second === null || second === undefined) {
            return first === second;
        }

        // If neither are empty, we can check if their constructors are equal. Because constructors are objects, if they are equal, we know the objects are of the same type (though not necessarily of the same value).
        if (first.constructor !== second.constructor) {
            return false;
        }

        // If we reach this point, we know both objects are of the same type so all we need to do is check what type one of the objects is, and then compare them
        if (first instanceof Function || first instanceof RegExp) {
            return first === second;
        }

        // Throught back to the equlity check we started with. Just incase we are comparing simple objects.
        if (first === second || first.valueOf() === second.valueOf()) {
            return true;
        }

        // If the value of check we saw above failed and the objects are Dates, we know they are not Dates because Dates would have equal valueOf() values.
        if (first instanceof Date) {
            return false;
        }

        // If the objects are arrays, we know they are not equal if their lengths are not the same.
        if (Array.isArray(first) && first.length !== second.length) {
            return false;
        }

        // If we have gotten to this point, we need to just make sure that we are working with objects so that we can do a recursive check of the keys and values.
        if (!(first instanceof Object) || !(second instanceof Object)) {
            return false;
        }

        // We now need to do a recursive check on all children of the object to make sure they are deeply equal
        const firstKeys = Object.keys(first),
            // Here we just make sure that all the object keys on this level of the object are the same.
            allKeysExist = Object.keys(second).every(
                i => firstKeys.indexOf(i) !== -1
            ),

            // Finally, we pass all the values of our of each object into this function to make sure everything matches
            allKeyValuesMatch = firstKeys.every(
                i => this.isEqual(first[i], second[i])
            );

        return allKeysExist && allKeyValuesMatch;
    },

    /**
     * Converts lists into objects
     * @param {Array} list to be converted
     * @param {Array} values the corresponding values of parallel array
     * @returns {Object} result
     */
    toObject: function (list, values) {
        const result = {};

        for (let i = 0, length = list.length; i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            }
            else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    },

    /**
     * Checks if value is an empty object or collection.
     * @param {Object} obj the object to be checked
     * @returns {boolean} true or false
     */
    isEmpty: function (obj) {
        return [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;
    },

    /**
     * helper function to find a key in nested object
     * @param {object} obj object to search
     * @param {string} key name of key to search for
     * @return {mixed} returns value for the given key or null if not found
     * @deprecated in 3.0.0
     */
    searchNestedObject: function (obj, key) {
        let result;

        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; i++) {
                result = this.searchNestedObject(obj[i], key);
                if (result) {
                    break;
                }
            }
        }
        else {
            for (const prop in obj) {
                if (prop === key) {
                    return obj;
                }
                if (obj[prop] instanceof Object || obj[prop] instanceof Array) {
                    result = this.searchNestedObject(obj[prop], key);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    }
});

export default Util;
