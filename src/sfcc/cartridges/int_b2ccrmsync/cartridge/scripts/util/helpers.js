'use strict';

/**
 * @module util/helpers
 */

/**
 * @description Expands a JSON String into an object.  Takes a JSON string and attempts
 * to deserialize it.  A default value can be applied in the event that deserialization fails.
 *
 * @param {String} jsonString Represents the JSON String being expanded and deserialized.
 * @param {*} defaultValue Represents the default value to be applied to the variable if the JSON
 * string could not be expanded / deserialized.
 * @returns {*} Returns undefined if empty string or exception encountered
 */
function expandJSON(jsonString, defaultValue) {
    var output = defaultValue;
    try {
        output = jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (e) {
        require('dw/system/Logger')
            .getLogger('int_b2ccrmsync', 'util/helpers')
            .error('Error parsing JSON: {0}', e);
    }
    return output;
}

module.exports.expandJSON = expandJSON;
