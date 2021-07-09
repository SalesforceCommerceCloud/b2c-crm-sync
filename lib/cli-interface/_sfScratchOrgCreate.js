/* eslint-disable no-underscore-dangle */
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
 * @function createScratchOrg
 * @description This function is used to create an sfdx scratch org using a configured profile.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:org:create')
        .requiredOption(
            config.get('cliOptions.sfScratchOrgProfile.cli'),
            config.get('cliOptions.sfScratchOrgProfile.description'),
            getProgramOptionDefault('sfScratchOrgProfile')
        )
        .option(
            config.get('cliOptions.sfScratchOrgAlias.cli'),
            config.get('cliOptions.sfScratchOrgAlias.description'),
            getProgramOptionDefault('sfScratchOrgAlias')
        )
        .option(
            config.get('cliOptions.sfScratchOrgSetDefault.cli'),
            config.get('cliOptions.sfScratchOrgSetDefault.description'),
            getProgramOptionDefault('sfScratchOrgSetDefault')
        )
        .option(
            config.get('cliOptions.sfScratchOrgDurationDays.cli'),
            config.get('cliOptions.sfScratchOrgDurationDays.description'),
            getProgramOptionDefault('sfScratchOrgDurationDays')
        )
        .description('Create a scratch-org leveraging the orgProfile specified via the CLI -- defaults to the ' +
            '.env; can be overridden via the CLI')
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
                    'Attempting to create a scratch org using the following environment details',
                    environmentDef);

                // Capture the results of creating the scratchOrg details
                const resultObj = await cliAPI.sfScratchOrgCreate(environmentDef);

                // Display the scratchOrg creation results
                cliUi.outputResults(
                    [resultObj.outputDisplay],
                    undefined,
                    'cliTableConfig.scratchOrgResults');

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
