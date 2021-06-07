'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

/**
 * @function _b2cDataDeployReset
 * @description This function is used to purge the contents of the B2C Commerce data deployment folder.
 * Commands are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:data:deploy:reset')
        .description('Resets the contents of the B2C Commerce data deployment-folder; purges the entire directory')
        .action(async commandObj => {

            try {

                // Open the bookend
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to reset the B2C data deployment folders');

                // Retrieve and output the results of the reset activity
                const resultObj = await cliAPI.b2cDeployReset(config.get('paths.b2cLabel'), config.get('paths.metadataPathLabel'));
                // Render the reset results
                console.log(' -- Reset results');
                cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.pathsSummary');

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
