'use strict';

// Initialize module dependencies
const validate = require('validate.js');

// Initialize any local libraries
const getValidationOutputValue = require('./_getValidationOutputValue');
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateB2CSiteIDs
 * @description This function is used to validate that site's are well defined
 *
 * @param {String} b2cSiteIDValues Represents the B2C Commerce storefronts / sites being targeted
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = b2cSiteIDValues => {
    // Initialize the siteValidation object
    const siteValidation = {};
    // Initialize the site error-count
    let siteErrorCount = 0;
    // If the sites aren't in JSON, fail the validation
    const output = getValidationOutputValue(b2cSiteIDValues);
    // Default the site validation attribute
    output.siteResults = undefined;
    // Default the site validation
    output.validationResult = false;

    if (validate.isString(output.value)) {
        output.value = [output.value];
    }

    // First, let's validate the the sites are in JSON format
    if (!validate.isArray(output.value)) {
        // Append the error message to the output object
        output.validationErrors = output.validationErrors.concat(' -- is not a JSON representation of B2C Commerce sites');
        // Return the output variable and exit early
        return output;
    }

    output.value.forEach(siteId => {
        // Create a validation output object for the current site
        const siteOutput = validateInputValue(siteId, 'B2CSiteID');
        // Did the current site fail validation?
        if (siteOutput.validationResult === false) {
            // If so, increment the error count
            siteErrorCount += 1;
        }

        // Append the site results to the validation object
        siteValidation[siteOutput.value] = siteOutput;
    });

    // No errors?  Update the validation-result accordingly
    output.validationResult = siteErrorCount === 0;

    // Was at least one error found?  Call-out that we've got partial validation success
    if (siteErrorCount > 0 && siteErrorCount !== output.value.length) {
        output.validationResult = 'partial';
    }

    // Append the site validation results to the output object
    output.siteResults = siteValidation;

    return output;
};
