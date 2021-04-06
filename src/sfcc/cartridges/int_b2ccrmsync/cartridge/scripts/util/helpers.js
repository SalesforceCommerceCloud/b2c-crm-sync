'use strict';

/**
 * @module util/helpers
 */

/**
 * Expands JSON
 *
 * @param {String} jsonString
 * @param {*} defaultValue
 *
 * @returns {*} Returns undefined if empty string or exception encountered
 */
function expandJSON(jsonString, defaultValue) {
    var output = defaultValue;
    try {
        output = jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (e) {
        require('dw/system/Logger').getLogger('int_b2ccrmsync', 'util/helpers').error('Error parsing JSON: {0}', e);
    }
    return output;
}

module.exports.expandJSON = expandJSON;
