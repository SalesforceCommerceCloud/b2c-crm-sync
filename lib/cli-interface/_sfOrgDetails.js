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
 * @function sfOrgDetails
 * @description This function is used to provide the details of the current scratch org.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:org:details')
        .option(
            config.get('cliOptions.sfScratchOrgUsername.cli'),
            config.get('cliOptions.sfScratchOrgUsername.description'),
            getProgramOptionDefault('sfScratchOrgUsername')
        )
        .description('Display the details of a scratch org leveraging the userName specified via the CLI -- defaults ' +
            'to the .env; can be overridden via the CLI')
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
                    'Attempting to retrieve the org details via SFDX',
                    environmentDef);

                // Retrieve the scratchOrg details
                const resultObj = await cliAPI.sfOrgDetails(environmentDef);

                // Output the details of the scratchOrg
                cliUi.outputResults(
                    resultObj.outputDisplay,
                    undefined,
                    'cliTableConfig.scratchOrgDetails');

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                // eslint-disable-next-line no-underscore-dangle
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
