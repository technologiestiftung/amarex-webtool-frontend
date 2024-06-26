/**
 * Splits all entries of the given list with the given limitor, creates a new array with unique single entries.
 * @info if no delimiter is given the list is returned as it is - in this instance no unique value list is created
 * @param {String[]} list a list of strings to be split
 * @param {String} delimiter the delimiter to split with or undefined if no split should be made
 * @returns {String[]} a new list with unique value
 */
export default function splitListWithDelimiter(list, delimiter) {
  if (!Array.isArray(list) || typeof delimiter !== "string") {
    return list;
  }
  const result = {};

  list.forEach((entry) => {
    if (typeof entry !== "string") {
      result[entry] = true;
      return;
    }
    const parts = entry.split(delimiter);

    parts.forEach((part) => {
      result[part] = true;
    });
  });

  return Object.keys(result);
}
