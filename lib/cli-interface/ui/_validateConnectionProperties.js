'use strict';

// Initialize constants
const outputResults = require('./_outputResults');

/**
 * @function outputEnvironmentDef
 * @description Output's the environment definition via the CLI
 *
 * @param {Object} validationResults Represents connectionPropertyValidationResults
 * @param {String} errorMessage Represents the errorMessage used to throw an error
 */
module.exports = (validationResults, errorMessage) => {

    // Evaluate if an error should / should not be thrown
    if (validationResults.isValid !== true) {
        outputResults(undefined, errorMessage);
        throw new Error(errorMessage);
    }

};
