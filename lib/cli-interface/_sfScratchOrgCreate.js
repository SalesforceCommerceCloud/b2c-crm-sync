'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

// Retrieve the helper function that calculates the default program option value
const getOperationMode = require('../../lib/cli-api/_common/_getOperationMode');
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
        .requiredOption(config.get('cliOptions.sfScratchOrgProfile.cli'), config.get('cliOptions.sfScratchOrgProfile.description'), getProgramOptionDefault('sfScratchOrgProfile'))
        .option(config.get('cliOptions.sfScratchOrgAlias.cli'), config.get('cliOptions.sfScratchOrgAlias.description'), getProgramOptionDefault('sfScratchOrgAlias'))
        .option(config.get('cliOptions.sfScratchOrgSetDefault.cli'), config.get('cliOptions.sfScratchOrgSetDefault.description'), getProgramOptionDefault('sfScratchOrgSetDefault'))
        .option(config.get('cliOptions.operationMode.cli'), config.get('cliOptions.operationMode.description'), getOperationMode, getProgramOptionDefault('operationMode'))
        .description('Create a scratch-org leveraging the orgProfile specified via the CLI -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const isJSONOperationMode = commandOptions.operationMode === config.get('operationMode.json');

            try {
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'start');
                    console.log(' -- Attempting to create a scratch org using the following environment details');
                    cliUi.outputEnvironmentDef(environmentDef);
                }

                const resultObj = await cliAPI.sfScratchOrgCreate(environmentDef);
                cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.scratchOrgResults');
            } catch (e) {
                cliUi.outputResults(undefined, JSON.stringify(e, null, 4));
            } finally {
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'end');
                }
            }
        });

    // Return the program with the appended command
    return commandProgram;
};
