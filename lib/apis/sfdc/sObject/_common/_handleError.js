'use strict';

/**
 * @function handleError
 * @description Helper function decorate errors with the success-response
 *
 * @param {Function} reject Represents the reject / errorHandler from the parent promise
 * @param {Object} errorObj Represents the error response provided by the parent-function
 * @returns {Promise} Returns the processed error rejection
 */
module.exports = (reject, errorObj) => {

    // Flag that an error was thrown
    errorObj.success = false;

    // If so, then reject the promise
    return reject(errorObj);

};
