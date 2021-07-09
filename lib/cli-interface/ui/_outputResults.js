'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');
const logo = require('asciiart-logo');

/**
 * @module _outputResults
 * @description Helper function to generate the results output via the CLI
 *
 * @param {Object} [results] Represents the roll-up summary object containing the results
 * @param {Object} [error] Represents the error object passed in the callback
 * @param {String} [tableConfigKey] Represents the key to get the table configs
 */
module.exports = (results, error, tableConfigKey) => {

    // Initialize local variables
    let tableConfig,
        table;

    // Start off by evaluating if we can display the success message
    if (results === undefined && error === undefined) {

        // Output the success message
        console.log(logo({
            name: 'SUCCESS!',
            font: 'Electronic',
            lineChars: 10,
            padding: 2,
            margin: 2,
            borderColor: 'black',
            logoColor: 'bold-green',
            textColor: 'green'
        })
            .emptyLine()
            .right('- Brought to You by the Full Power of Salesforce Architects')
            .right('Architect Success, SCPPE, Services, & Alliances')
            .emptyLine()
            .render()
        );

    }

    // Were results provided?
    if (results && tableConfigKey) {

        // Retrieve the table definition
        tableConfig = config.get(tableConfigKey);

        // If not JSON operation mode, build a beautiful table to render within the console
        table = new Table(tableConfig);

        // Create the CLI table to display the results
        results.forEach(result => {
            if (Array.isArray(result)) {
                table.push(result);
            } else {
                table.push(Object.keys(result).map(key => result[key] === undefined ? '-----' : result[key]));
            }
        });

        // Render the CLI table
        console.log(table.toString());
    }

    // Was an error presented?
    if (error) {

        // Print the output in case of JSON mode, which is an aggregate of all the subsequent results
        console.log(logo({
            name: 'Error!',
            font: 'Univers',
            lineChars: 60,
            padding: 2,
            margin: 2,
            borderColor: 'black',
            logoColor: 'bold-red',
            textColor: 'red'
        })
            .center('Oh no! Not one of these :(')
            .emptyLine()
            .center('It looks like you\'ve run into an error or exception.')
            .center('Please log an issue via https://sfb2csa.link/sync/issues.')
            .center('That\'s the best way to engage us.  Thank you for your support!')
            .render()
        );

        // Is an error defined without the stack-trace?
        if (error.stack === undefined) {
            if (typeof error === 'object') {
                console.log(` -- ${JSON.stringify(error, null, 2)}`);
            } else {
                console.log(` -- ${error}`);
            }
        } else {

            // Output the error message details
            console.log('----------------------------------------------------------------------------');
            console.log(' Error Message: StackTrace: START');
            console.log('----------------------------------------------------------------------------');
            console.log(error.stack);
            console.log('----------------------------------------------------------------------------');
            console.log(' Error Message: StackTrace: END');
            console.log('----------------------------------------------------------------------------');

        }

    }
};
