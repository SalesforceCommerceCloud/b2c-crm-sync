'use strict';

/**
 * @function _verifyB2CSiteIDs
 * @description This function is used to verify that all of the B2C Commerce siteIds specified
 * have been defined and passed their individual validation.
 *
 * @param {Object} siteValidationResults Represents the B2C Commerce site validation results that have been processed
 * @returns {*} Returns true if the B2C Commerce sites have all passed validation;
 * false if none; partial if mixed results
 */
module.exports = siteValidationResults => {
    const errorCount = siteValidationResults.value.reduce((totalErrors, site) => {
        const siteValidationResult = siteValidationResults.siteResults[site];
        // Did this site pass validation?
        if (siteValidationResult.validationResult === false) {
            // If not, update the error count
            // eslint-disable-next-line no-param-reassign
            totalErrors += 1;
        }

        return totalErrors;
    }, 0);

    // No errors?  All sites are valid
    if (errorCount === 0) {
        return true;
    }

    // All errors?  Call out that all sites are invalid
    if (errorCount === siteValidationResults.value.length) {
        return false;
    }

    // Return the verification results
    return 'partial';
};
