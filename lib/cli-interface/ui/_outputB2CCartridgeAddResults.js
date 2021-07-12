'use strict';

// Initialize local libraries
const outputB2CCartridgeInEligibleResults = require('./_outputB2CCartridgeInEligibleResults');
const outputB2CCartridgeEligibleResults = require('./_outputB2CCartridgeEligibleResults');

/**
 * @private
 * @function _outputB2CCartridgeAddResults
 * @description Output the display of cartridge removal results
 *
 * @param {Object} resultObj Represents the results object captured by the API
 * @param {Object} [errorObj] Represents the error detail object captured by the API
 */
module.exports = (resultObj, errorObj) => {
    const inEligibleSites = resultObj.eligibilityResults.inEligible.siteIds;
    const eligibleSites = resultObj.eligibilityResults.eligible.siteIds;

    // Does the current results have invalid sites?
    if (inEligibleSites.length > 0) {
        // If so, then output the inEligible results (show any validation errors)
        outputB2CCartridgeInEligibleResults(resultObj.eligibilityResults.inEligible);
    }

    // Does the current results have processed sites?
    if (eligibleSites.length > 0) {
        // If so, then output the eligible results (show processing results and error failures)
        outputB2CCartridgeEligibleResults(resultObj, errorObj, 'cartridgeAdd', 'messages.b2c.cartridgeAddedSuccessfully');
    }
};
