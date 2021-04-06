'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');

/**
 * @function _outputTemplateResults
 * @description Helper function to generate the sfdx template rendering results
 * @param {Object} templateResults Represents the roll-up summary object containing the template details
 * @param {Object} error Represents the error object passed in the callback
 */
module.exports = (templateResults, error, operationMode = config.get('operationMode.default'), renderJsonMode = true) => {
    const isJSONOperationMode = operationMode === config.get('operationMode.json');

    // In case of JSON operation mode, just print out the result in the console as-is
    if (isJSONOperationMode && renderJsonMode) {
        console.log('%s', JSON.stringify(templateResults, null, 2));
        if (error) {
            console.log(` -- ${JSON.stringify(error)}`);
        }

        return;
    }

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

    if (error) {
        console.log(` -- ${JSON.stringify(error)}`);
    }
};
