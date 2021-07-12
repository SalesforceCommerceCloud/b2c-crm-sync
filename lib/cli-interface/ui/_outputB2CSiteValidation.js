'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');

// Initialize local libraries
const outputEnvironmentDef = require('./_outputEnvironmentDef');

/**
 * @function outputB2CSiteValidation
 * @description Output's the B2C Site validation via the CLI
 *
 * @param {Object} siteResults Represents the summarized B2C site validation results
 * @param {Object} [error] Represents any error messaging being carried forward to the CLI
 * @param {Boolean} [hideEnvironmentDef] Describes if the environmentDetails should be hidden
 */
module.exports = (siteResults, error, hideEnvironmentDef = false) => {
    let table;

    // Evaluate if the environmentDef should be rendered
    if (hideEnvironmentDef === false) {
        // Render the CLI table that displays the environment details
        outputEnvironmentDef(siteResults.environmentDetails);
    }

    // Were any validation errors caught?  If so, then let's output them
    if (siteResults.b2cSiteProperties.validationResult !== true) {
        // Initialize the table header for the site errors
        table = new Table(config.get('cliTableConfig.siteErrors'));

        // Filter only site which failed validation -- capture the error message to display
        siteResults.b2cSiteProperties.value.filter(
            siteKey => !siteResults.b2cSiteProperties.siteResults[siteKey].validationResult
        ).forEach(
            siteKey => {
                table.push([siteKey, siteResults.b2cSiteProperties.siteResults[siteKey].validationErrors]);
            }
        );

        // Output the validation errors
        console.log(table.toString());
    }

    // Only output the validation summary if it exists
    if (Object.prototype.hasOwnProperty.call(siteResults, 'validationSummary')) {
        // Initialize the table header for the site output
        table = new Table(config.get('cliTableConfig.siteOutput'));

        siteResults.validationSummary.forEach(key => {
            // Add the key / value pair to the table output
            table.push([key.siteId, key.status, key.statusText, key.url]);
        });

        // Output the table to the CLI
        console.log(table.toString());
    }

    // Only output the error if a real error is thrown
    if (error) {
        // Display the caught error message
        console.log(` -- ${error}`);
    }
};
