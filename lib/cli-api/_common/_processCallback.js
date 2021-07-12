'use strict';

// Initialize required modules
const validate = require('validate.js');

/**
 * @function _processCallback
 * @description Generic handler for callback processing
 * @param {Object} errorObj  represents the errorObject caught
 * @param {Object} resultsObj  represents the output object containing processing results
 * @param {Function} callbackFunction  Represents the callback function to fire / execute
 */
function processCallback(errorObj, resultsObj, callbackFunction) {

    // Exit early if no callback function is defined
    if (callbackFunction === undefined) { return; }

    // Was an error caught during processing?
    if (!validate.isEmpty(errorObj)) {

        // Audit the exception and return the callback
        callbackFunction(errorObj, resultsObj);

    } else {

        // Otherwise, return the output without the error
        callbackFunction(null, resultsObj);

    }

}

module.exports = processCallback;
