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
        .option(config.get('cliOptions.sfScratchOrgUsername.cli'), config.get('cliOptions.sfScratchOrgUsername.description'), getProgramOptionDefault('sfScratchOrgUsername'))
        .option(config.get('cliOptions.operationMode.cli'), config.get('cliOptions.operationMode.description'), getOperationMode, getProgramOptionDefault('operationMode'))
        .description('Display the details of a scratch org leveraging the userName specified via the CLI -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const isJSONOperationMode = commandOptions.operationMode === config.get('operationMode.json');

            // Initialize the local variables for output
            let hostName,
                loginUrl;

            try {
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'start');
                    console.log(' -- Attempting to retrieve the user details');
                }

                const resultObj = await cliAPI.sfUserDetails(environmentDef);
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDetails');

                // Default the individual output local variables
                hostName = resultObj.result.instanceUrl;
                loginUrl = resultObj.result.loginUrl;

                // Format the urls
                hostName = hostName.replace('https:', '');
                hostName = hostName.replace(/\//g, '');
                loginUrl = loginUrl.replace('https:', '');
                loginUrl = loginUrl.replace(/\//g, '');

                // Output the configuration details
                console.log(`

######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=${hostName}
SF_LOGINURL=${loginUrl}
SF_USERNAME=${resultObj.result.username}
SF_PASSWORD=${resultObj.result.password}
                `);

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
