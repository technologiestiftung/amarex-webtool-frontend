/* eslint-disable no-undef */
/**
 * Sorts an array of objects in the order of the nested attributes passed.
 * @param {Object[]} objects The objects to be sorted.
 * @param {String[]} nestedAttributes The nested attributes to be sorted by.
 * @returns {void}
 */
export function sortObjectsByNestedAttributes (objects, nestedAttributes) {
    const cloneObjects = [...objects];

    nestedAttributes.forEach(nestedAttribute => {
        sortObjects(cloneObjects, nestedAttribute);
    });

    return cloneObjects;
}

export default {sortObjectsByNestedAttributes};
