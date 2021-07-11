/* eslint-disable no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

/**
 * @function b2cDeploySetup
 * @description This function is used to setup the deployment folder.  Commands are abstracted in this
 * manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:deploy:setup')
        .description('Attempts to validate the setup of the B2C deployment folders; creates them if they are missing')
        .action(async commandObj => {

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to setup the B2C deployment folders (both code & data)');

                // Retrieve and output the results of the setup activity
                const results = await cliAPI.b2cDeploySetup();

                // Render the reset results
                cliUi.outputResults(
                    results.map(result => result.outputDisplay),
                    undefined,
                    'cliTableConfig.pathsSummary');

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
