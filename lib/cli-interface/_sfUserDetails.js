/* eslint-disable no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function userDetails
 * @description This function is used to provide the details of the current user.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:user:details')
        .option(
            config.get('cliOptions.sfScratchOrgUsername.cli'),
            config.get('cliOptions.sfScratchOrgUsername.description'),
            getProgramOptionDefault('sfScratchOrgUsername')
        )
        .description('Display the details of the orgUser leveraging the userName specified via the CLI ' +
            '-- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to retrieve the user details from the Salesforce Org',
                    environmentDef);

                // Get the end-user details
                const resultObj = await cliAPI.sfUserDetails(environmentDef);

                // Output the orgDetails
                cliUi.outputResults(
                    resultObj.outputDisplay,
                    undefined,
                    'cliTableConfig.scratchOrgDetails');

                // Output the userDetails
                cliUi.outputSFUserDetails(resultObj);

                // Has the securityToken been defined in the .env file?
                if (Object.prototype.hasOwnProperty.call(resultObj.result, 'password')
                    && resultObj.result.password.length === 0) {

                    console.log(' -- If you haven\'t done so already, please reset your password via');
                    console.log(' -- the following SFDX CLI Command:');
                    console.log('');
                    console.log('    sfdx force:user:password:generate');
                    console.log('');
                    console.log(' -- You can then re-run this command to view the password and copy it');
                    console.log(' -- to your .env configuration file.');
                    console.log('');

                }

            } catch (e) {

                // Output and catch any error
                cliUi.outputResults(undefined, e);

            } finally {

                // Close out the display and bookend the output
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
