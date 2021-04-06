'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize the CLI UI collection of functions
const cliUi = require('../../lib/cli-interface/ui');

// Retrieve the helper function that calculates the default program option value
const getOperationMode = require('../../lib/cli-api/_common/_getOperationMode');
const getScratchOrgSetDefault = require('../../lib/cli-api/_common/_getScratchOrgSetDefault');
const getScratchOrgForceOverwrite = require('../../lib/cli-api/_common/_getScratchOrgForceOverwrite');
const getScratchOrgProfile = require('../../lib/cli-api/_common/_getScratchOrgProfile');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function getDxOrgEnvironment
 * @description This function is used to expose the scratch-org runtimeEnvironment details to a CLI user.  Commands
 * are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:org:env:list')
        .option(config.get('cliOptions.sfScratchOrgUsername.cli'), config.get('cliOptions.sfScratchOrgUsername.description'), getProgramOptionDefault('sfScratchOrgUsername'))
        .option(config.get('cliOptions.sfScratchOrgProfile.cli'), config.get('cliOptions.sfScratchOrgProfile.description'), getScratchOrgProfile, getProgramOptionDefault('sfScratchOrgProfile'))
        .option(config.get('cliOptions.sfScratchOrgAlias.cli'), config.get('cliOptions.sfScratchOrgAlias.description'), getProgramOptionDefault('sfScratchOrgAlias'))
        .option(config.get('cliOptions.sfScratchOrgSetDefault.cli'), config.get('cliOptions.sfScratchOrgSetDefault.description'), getScratchOrgSetDefault, getProgramOptionDefault('sfScratchOrgSetDefault'))
        .option(config.get('cliOptions.sfScratchOrgForceOverwrite.cli'), config.get('cliOptions.sfScratchOrgForceOverwrite.description'), getScratchOrgForceOverwrite, getProgramOptionDefault('sfScratchOrgForceOverwrite'))
        .option(config.get('cliOptions.operationMode.cli'), config.get('cliOptions.operationMode.description'), getOperationMode, getProgramOptionDefault('operationMode'))
        .description('Attempts to read the current environment definition either through the CLI, the .env configuration file, or a combination (overriding the .env via the CLI)')
        .action(commandObj => {
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const isJSONOperationMode = commandOptions.operationMode === config.get('operationMode.json');

            // Was this command executed in json mode (ex. only output JSON)
            if (isJSONOperationMode) {
                // If so, then let's output the calculated environment definition via the CLI
                console.log('%s', JSON.stringify(environmentDef, null, 2));
            } else {
                // Generate the opening CLI command bookend for this command
                cliUi.cliCommandBookend(commandObj._name, 'start');
                // Output the environment definition visually
                cliUi.outputEnvironmentDef(environmentDef);
                // Close the CLI command bookend for this command
                cliUi.cliCommandBookend(commandObj._name, 'end');
            }
        });

    // Return the program with the appended command
    return commandProgram;
};
