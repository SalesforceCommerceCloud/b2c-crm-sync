'use strict';

// Initialize constants
const validate = require('validate.js');

/**
 * @function genericAsyncCallbackHelper
 * @description Helper function to manage independent callback processing within async
 * @param {*} errorObj Represents the callback errorObj being processed
 * @param {Function} genericCallback Represents the callback function to execute
 * @param {*} [errorObjOverride] Represents the errorObj to throw instead of the callback errorObj
 */
module.exports = (errorObj, genericCallback, errorObjOverride) => {
    // Was an error caught?
    if (validate.isEmpty(errorObj) === true) {
        // If not, continue processing
        genericCallback();
        return;
    }

    // Was the callback error to throw defined?
    if (errorObjOverride === undefined) {
        // If not, then throw the errorObj
        genericCallback(errorObj);
    } else {
        // Otherwise, continue throw an error
        genericCallback(errorObjOverride);
    }
};
