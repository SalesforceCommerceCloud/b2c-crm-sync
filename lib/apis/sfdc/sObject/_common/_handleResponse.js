'use strict';

/**
 * @function handleResponse
 * @description Helper function to route the response to the proper Promise handler.
 * Either rejects errors or resolves the response with a success-flag describing the output.
 *
 * @param {Function} resolve Represents the resolution handler from the parent promise
 * @param {Function} reject Represents the reject / errorHandler from the parent promise
 * @param {Object} errorObj Represents the error response provided by the parent-function
 * @param {Object} responseObj Represents the successful parent-function response
 */
module.exports = (resolve, reject, errorObj, responseObj) => {

    // Was an error thrown?
    if (errorObj) {

        // Flag that an error was thrown
        errorObj.success = false;

        // If so, then reject the promise
        reject(errorObj);

    } else {

        // Flag that the result was successful
        responseObj.success = true;

        // Otherwise, return the sObject
        resolve(responseObj);

    }

}
