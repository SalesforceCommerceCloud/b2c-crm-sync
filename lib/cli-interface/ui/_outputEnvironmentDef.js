'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');

// Initialize required libraries
const validators = require('../../../lib/cli-api/validators');

/**
 * @function outputEnvironmentDef
 * @description Output's the environment definition via the CLI
 *
 * @param {environmentDef} environmentDef Represents the environment being rendered visually
 */
module.exports = environmentDef => {
    // Capture the validation defaults for the environment configuration
    let validationDetails = {};
    let validationResults = {};

    // Initialize the table header
    let table = new Table({
        head: ['Env. Property Name', 'Is Valid', 'Configured Property Value'],
        colWidths: [30, 10, 77],
        colAligns: ['right', 'middle', 'left']
    });

    // Loop over the connection of environment-keys
    Object.keys(environmentDef).filter(key => key !== 'operationMode').forEach(key => {

        // Create a reference to the current environment property
        const environmentProperty = config.util.toObject(config.get(`cliOptions.${key}`));

        // Does this property have a validator assigned?
        if (environmentProperty.hasOwnProperty('validator')) {
            // Evaluate the values of each configured environment property
            validationDetails = validators[config.get(`cliOptions.${key}.validator`).toString()](environmentDef[key]);
        } else {
            // If not, denote that no validation was performed
            validationDetails.validationResult = '----';
        }

        // Capture the validation results for the processed keys
        validationResults[key] = validationDetails;

        let keyValue = environmentDef[key];
        if (keyValue === undefined) { keyValue = ''; }

        // Add the key / value pair to the table output
        table.push([key, validationDetails.validationResult, keyValue]);

    });

    // Output the table to the CLI
    console.log(table.toString());

    // Initialize the table header to display environment errors
    let newTable = new Table(config.get('cliTableConfig.environmentErrors'));

    // Loop over the connection of environment-keys
    Object.keys(environmentDef).filter(key => key !== 'operationMode' && key !== 'b2cInstanceName').forEach(key => {
        // Are we processing siteIds?
        if (key === 'b2cSiteIds') {
            // Loop over the collection of sites -- and grab individual validation errors
            for (let siteIndex = 0; siteIndex < validationResults[key].value.length; siteIndex++) {
                // Create a reference to the current site
                const site = validationResults.b2cSiteIds.siteResults[validationResults[key].value[siteIndex]];

                // Did the current site fail validation?
                if (site.validationResult === false) {
                    // Add the key / value pair to the table output; grab the first error only
                    newTable.push([site.value, site.validationErrors[0]]);
                }
            }
        // Does this property have a validator assigned?
        } else if (validationResults[key].validationResult === false) {
            // Add the key / value pair to the table output; grab the first error only
            newTable.push([key, validationResults[key].validationErrors[0]]);
        }
    });

    // Only output the validation errors if they're present in the array
    if (newTable.length > 0) {
        console.log(newTable.toString());
    }
};
