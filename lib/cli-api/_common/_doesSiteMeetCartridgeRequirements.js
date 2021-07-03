'use strict';

// Initialize constants
const config = require('config');

/**
 * @function _doesSiteMeetCartridgeRequirements
 * @description Helper function used to evaluate if a cartridge exists in the cartridge path, and
 * capture an error depending on whether the cartridge does OR does NOT exist
 *
 * @param {Array} requireResults Array represents the evaluated cartridge results
 * @param {Boolean} [comparisonValue] Represents the boolean value used to imply success or failure
 * @param {string} [errorMessageKey] Represents the config.js error key containing the error message to use
 * @return {{isValid: boolean, siteDetails: null, errors: []}} Returns a composite object describing the findings
 */
module.exports = (requireResults, comparisonValue = false, errorMessageKey = 'errors.b2c.cartridgePathMissingRequirement') => {
    let errorCount = 0;
    const output = {
        isValid: true,
        siteDetails: null,
        errorDetails: []
    };

    requireResults.forEach(requireResult => {
        // Create a reference to the current site's details
        output.siteDetails = requireResult.siteDetails;

        // Does the current site have the cartridge requirement?
        if (requireResult.hasCartridge === comparisonValue) {
            // Increment the error count
            errorCount = errorCount + 1;

            // Create the error message for this specific instance
            let errorMessage = config.get(errorMessageKey).toString();
            // Attach the cartridge to the error output
            output.cartridgeName = requireResult.cartridge.name;
            // Create the cartridge-specific error message
            output.errorDetails.push({cartridgeName: requireResult.cartridge.name, errorMessage: errorMessage});
        }
    });

    // If all require-results are errors -- then flag the site as false
    output.isValid = errorCount < requireResults.length;

    return output;
};
