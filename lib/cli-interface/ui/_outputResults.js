'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');

/**
 * @module _outputResults
 * @description Helper function to generate the results output via the CLI
 *
 * @param {Object} results Represents the roll-up summary object containing the results
 * @param {Object} error Represents the error object passed in the callback
 * @param {String} tableConfigKey Represents the key to get the table configs
 * @param {String} operationMode Represents the operation mode to know how to render the results/error
 * @param {Boolean} renderJson Describes if JSON should be rendered via the console
 */
module.exports = (results, error, tableConfigKey, operationMode = config.get('operationMode.default'), renderJson = false) => {
    const isJSONOperationMode = operationMode === config.get('operationMode.json');

    // In case of JSON operation mode, just print out the result in the console as-is
    if (isJSONOperationMode && renderJson) {
        console.log('%s', JSON.stringify(results, null, 2));
        if (error) {
            console.log(` -- ${error}`);
        }

        return;
    }

    if (results && tableConfigKey) {
        const tableConfig = config.get(tableConfigKey);
        // If not JSON operation mode, build a beautiful table to render within the console
        const table = new Table(tableConfig);

        // Create the CLI table to display the results
        results.forEach(result => {
            if (Array.isArray(result)) {
                table.push(result);
            } else {
                table.push(Object.keys(result).map(key => result[key]));
            }
        });
        // Render the CLI table
        console.log(table.toString());
    }

    if (error) {
        console.log(` -- ${error}`);
    }
};
