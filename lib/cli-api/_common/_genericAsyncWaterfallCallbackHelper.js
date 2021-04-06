'use strict';

// Initialize constants
const validate = require('validate.js');

/**
 * @function _genericAsyncWaterfallCallbackHelper
 * @description Helper function to manage independent waterfall-callback processing within async
 * @param {*} errorObj Represents the callback errorObj being processed
 * @param {*} outputValue Represents the callback value object / payload to carry forward
 * @param {Function} genericCallback Represents the callback function to execute
 */
module.exports = (errorObj, outputValue, genericCallback) => {
    // Was an error caught during processing?
    if (!validate.isEmpty(errorObj)) {
        // Audit the exception and return the callback
        genericCallback(errorObj, outputValue);
        return;
    }

    // Otherwise, return the output without the error
    genericCallback(null, outputValue);
};
