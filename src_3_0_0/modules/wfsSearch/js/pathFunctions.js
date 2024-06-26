import { badPathSymbol, idx } from "../../../shared/js/utils/idx";

/**
 * Builds the path to the given option in the external source object.
 *
 * @param {Object} optionsObject The currently set values by the user.
 * @param {String} currentOption The option for which the path needs to be build.
 * @param {Object} parsedSource source to resolve ID keys by
 * @returns {array} The path to the given option as an array.
 */
function buildPath(optionsObject, currentOption, parsedSource) {
  const entries = Object.entries(optionsObject),
    path = [];

  // used to verify path taken
  let objectWalker = parsedSource;

  for (const entry of entries) {
    const [key, { value, index }] = entry,
      values = key === "" ? [value] : [key, index];

    // This would otherwise lead to weird path behaviour as the option of this Field has already been added to the selectedOptions
    if (key === currentOption) {
      break;
    }

    // if value doesn't exist as key, it's an id
    if (typeof objectWalker[values[0]] === "undefined") {
      values[0] = Object.entries(objectWalker).find(
        (pair) => pair[1].id === values[0],
      )[0];
    }

    objectWalker = objectWalker[values[0]];

    if (typeof values[1] !== "undefined") {
      objectWalker = objectWalker[values[1]];
    }

    path.push(...values);
  }
  path.push(currentOption);

  return path;
}

/**
 * Retrieves the options from the path in the given source.
 *
 * @param {array} path The path to the values.
 * @param {Object} source The source from which the values should be retrieved.
 * @returns {Array} If found, return the values as an array, otherwise return an empty array.
 */
function getOptions(path, source) {
  const selectableOptions = idx(source, path);

  if (
    selectableOptions &&
    selectableOptions !== badPathSymbol &&
    typeof selectableOptions[0] === "object"
  ) {
    return prepareOptionsWithId(selectableOptions);
  }

  // idx returns badPathSymbol if the value could not be found. It is also possible that the value is defined, but holds null or undefined.
  return selectableOptions === badPathSymbol ||
    selectableOptions === null ||
    selectableOptions === undefined
    ? []
    : selectableOptions;
}

/**
 * Prepares the options to be able to be used with the components.
 * Maps id to fieldValue and adds the key to the displayName of the root element if so configured.
 *
 * @param {Object} elements The options to be adjusted / prepared.
 * @param {Boolean} [showKey = false] Whether the key should be part of the displayName.
 * @returns {array} The adjusted array of values.
 */
function prepareOptionsWithId(elements, showKey = false) {
  const options = [];

  Object.entries(elements).forEach(([key, { id }]) =>
    options.push({
      fieldValue: id,
      displayName: showKey ? `${key} (${id})` : id,
    }),
  );

  return options;
}

/**
 * Removes the path to the element so that just the value itself is left.
 *
 * @param {String} el The element of which the path should be removed.
 * @returns {String} The adjusted element.
 */
function removePath(el) {
  let element = el;

  while (element.includes(".")) {
    element = element.slice(element.indexOf(".") + 1);
  }
  return element;
}

export { buildPath, getOptions, prepareOptionsWithId, removePath };
