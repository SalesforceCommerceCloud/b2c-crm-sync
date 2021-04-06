'use strict';

// Initialize local libraries
const outputB2CCartridgeInEligibleResults = require('./_outputB2CCartridgeInEligibleResults');
const outputB2CCartridgeEligibleResults = require('./_outputB2CCartridgeEligibleResults');

/**
 * @private
 * @function _outputB2CCartridgeRemoveResults
 * @description Output the display of cartridge removal results
 *
 * @param {Object} resultObj Represents the results object captured by the API
 * @param {Object} errorObj Represents the error detail object captured by the API
 */
module.exports = (resultObj, errorObj) => {
    // Does the current results have invalid sites?
    if (resultObj.eligibilityResults.inEligible.siteIds.length > 0) {
        // If so, then output the inEligible results
        outputB2CCartridgeInEligibleResults(
            resultObj.eligibilityResults.inEligible,
            'cliTableConfig.cartridgeAddErrors'
        );
    }

    // Does the current results have processed sites?
    if (resultObj.eligibilityResults.eligible.siteIds.length > 0) {
        // If so, then output the eligible results
        outputB2CCartridgeEligibleResults(resultObj, errorObj, 'cartridgeRemove', 'messages.b2c.cartridgeRemovedSuccessfully');
    }
};
