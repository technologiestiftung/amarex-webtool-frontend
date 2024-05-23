/**
 * Replaces all non-alphanumeric characters with underscores.
 * @param {string} selector string to be checked
 * @returns {string}
 */

export default function sanitizeSelector(selector) {
    return selector.replace(/[^a-zA-Z0-9-_:]+/g, "_");
}
