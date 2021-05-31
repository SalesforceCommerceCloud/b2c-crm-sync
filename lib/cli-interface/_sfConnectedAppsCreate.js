'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function createConnectedApps
 * @description This function is used to create the SFDC Connected Apps sfdx template entry using
 * corresponding environment variables to render the template.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:connectedapps')
        .requiredOption(config.get('cliOptions.b2cHostName.cli'), config.get('cliOptions.b2cHostName.description'), getProgramOptionDefault('b2cHostName'))
        .requiredOption(config.get('cliOptions.b2cClientId.cli'), config.get('cliOptions.b2cClientId.description'), getProgramOptionDefault('b2cClientId'))
        .requiredOption(config.get('cliOptions.b2cClientSecret.cli'), config.get('cliOptions.b2cClientSecret.description'), getProgramOptionDefault('b2cClientSecret'))
        .requiredOption(config.get('cliOptions.b2cSiteIds.cli'), config.get('cliOptions.b2cSiteIds.description'), getProgramOptionDefault('b2cSiteIds'))
        .description('Generate the SFDX ConnectedApps deployment metadata -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            try {

                // Output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to authenticate against the configured Salesforce Core Platform instance using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Generate the SFDX Connected Apps meta-data template
                const resultObj = await cliAPI.sfConnectedAppsCreate(environmentDef);
                console.log(' -- Connected apps template file(s) generated for the following sites');
                cliUi.outputResults(resultObj.outputDisplay.verifySites.success, undefined, 'cliTableConfig.siteOutput');
                resultObj.outputDisplay.siteIds.filter(site => resultObj.outputDisplay.siteTemplateResults.hasOwnProperty(site)).forEach(site => cliUi.outputTemplateResults(resultObj.outputDisplay.siteTemplateResults[site]));

            } catch (e) {

                cliUi.outputTemplateResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
