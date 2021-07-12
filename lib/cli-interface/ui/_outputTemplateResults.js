'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');

/**
 * @function _outputTemplateResults
 * @description Helper function to generate the sfdx template rendering results
 *
 * @param {Object} templateResults Represents the roll-up summary object containing the template details
 * @param {Object} [error] Represents the error object passed in the callback
 * @returns {Boolean} No true if operation is successful
 */
module.exports = (templateResults, error) => {

    // Initialize local variables
    let errorMessage;

    // Were templateResults provided?
    if (templateResults) {

        // Initialize the table header for the auth-token output
        const filePathTable = new Table(config.get('cliTableConfig.filePathTable'));
        const fileContentsTable = new Table(config.get('cliTableConfig.fileContentsTable'));

        // Create the CLI table to display the template path results
        filePathTable.push([
            templateResults.filePath
        ]);

        // Render the CLI table
        console.log(filePathTable.toString());

        // Was the template-write successful?
        if (templateResults.success === true) {
            // Create the CLI table to display the template contents results
            fileContentsTable.push([
                templateResults.fileContents
            ]);

            // Render the CLI table
            console.log(fileContentsTable.toString());

        }

    }

    // Was an error provided?
    if (error) {

        // Serialize the error message
        errorMessage = JSON.stringify(error);

        // Evaluate if the errorMessage was serialized to an empty object
        if (errorMessage === '{}') {

            // If so, then output the error message
            console.log(` -- ${error}`);

        } else {

            // Otherwise, output the JSON
            console.log(` -- ${errorMessage}`);

        }

    }

    // Confirm operation completed
    return true;

};
