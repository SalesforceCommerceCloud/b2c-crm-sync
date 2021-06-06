'use strict';

/**
 * @function _setValidationOutputResult
 * @description This function is used to set the final output object describing
 * the validation results as processed by the CLI option validation logic.
 *
 * @param {Object} validationOutput Represents the validation output value
 * @param {Object} validationResults Represents the validation results to process
 * @return {Object} Returns the validation object object leveraged by the validators
 */
module.exports = (validationOutput, validationResults) => {
    // Were any validation errors caught
    if (validationResults !== undefined) {
        // If any validation errors were found, then append then to the validation output
        validationOutput.validationErrors = validationOutput.validationErrors.concat(validationResults.value);
        // Since we have errors, set the flag that errors were caught
        validationOutput.validationResult = false;
    } else {
        // Otherwise, validation has passed -- say so
        validationOutput.validationResult = true;
    }

    return validationOutput;
};
