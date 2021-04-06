'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');
const validate = require('validate.js');

/**
 * @private
 * @function _outputB2CCartridgeEligibleResults
 * @description Output the results of eligible cartridges
 *
 * @param {Object} resultObj Represents the results object captured by the API
 * @param {Object} errorObj Represents the error detail object captured by the API
 */
module.exports = (resultObj, errorObj, resultKey, messageLabel) => {
    // Initialize the table definition
    const table = new Table(config.get('cliTableConfig.cartridgeSummary'));

    // Was an error caught? If so, the output the error message
    if (!validate.isEmpty(errorObj)) {
        console.log(` -- ${errorObj}`);
    }

    // Evaluate if the resultObj has a cartridgeRemove property (ie -- there are processed cartridge results)
    if (resultObj.apiCalls.hasOwnProperty(resultKey) && resultObj.apiCalls[resultKey].length > 0) {
        resultObj.apiCalls[resultKey].forEach(cartridgeResult => {
            const cartridgeMessage = cartridgeResult.isValid === false ? cartridgeResult.errorObj : config.get(messageLabel);
            // Add the details for the current result to the table array
            table.push([cartridgeResult.siteId, cartridgeResult.cartridgeId.name, cartridgeMessage]);
        });

        // Output the error result if any errors are caught
        if (table.length > 0) {
            console.log(table.toString());
        }
    }
};
