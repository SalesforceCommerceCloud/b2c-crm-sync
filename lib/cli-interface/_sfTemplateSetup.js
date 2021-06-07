'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
* @function dxTemplateSetup
* @description This function is used to create all of the SFDX meta-date templates required to
* deploy the SFDX code.
*
* @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
* @return {Object} Returns the updated commandProgram -- including the command that was just attached
*/
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:setup')
        .requiredOption(config.get('cliOptions.b2cHostName.cli'), config.get('cliOptions.b2cHostName.description'), getProgramOptionDefault('b2cHostName'))
        .requiredOption(config.get('cliOptions.b2cSiteIds.cli'), config.get('cliOptions.b2cSiteIds.description'), getProgramOptionDefault('b2cSiteIds'))
        .requiredOption(config.get('cliOptions.b2cClientId.cli'), config.get('cliOptions.b2cClientId.description'), getProgramOptionDefault('b2cClientId'))
        .requiredOption(config.get('cliOptions.b2cClientSecret.cli'), config.get('cliOptions.b2cClientSecret.description'), getProgramOptionDefault('b2cClientSecret'))
        .requiredOption(config.get('cliOptions.b2cUsername.cli'), config.get('cliOptions.b2cUsername.description'), getProgramOptionDefault('b2cUsername'))
        .requiredOption(config.get('cliOptions.b2cAccessKey.cli'), config.get('cliOptions.b2cAccessKey.description'), getProgramOptionDefault('b2cAccessKey'))
        .option(config.get('cliOptions.b2cInstanceName.cli'), config.get('cliOptions.b2cInstanceName.description'), getProgramOptionDefault('b2cInstanceName'))
        .description('Generate the SFDX templates (trustedSites, remoteSiteSettings, and namedCredentials) deployment metadata -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            try {

                // Open the bookend and output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to generate the Trusted Site file using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Create the trusted sites
                let resultObj = await cliAPI.sfTrustedSitesCreate(environmentDef);
                console.log(' -- Trusted sites template file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Create the remote sites settings
                resultObj = await cliAPI.sfRemoteSitesCreate(environmentDef);
                console.log(' -- Remote site settings template file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Create the AM named credentials
                resultObj = await cliAPI.sfNamedCredentialsAMCreate(environmentDef);
                console.log(' -- "Account Manager" Named Credentials template file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Create the OOBO named credentials
                resultObj = await cliAPI.sfNamedCredentialsOOBOCreate(environmentDef);
                console.log(' -- "Order On Behalf" Named Credentials template file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Create the connected apps
                resultObj = await cliAPI.sfConnectedAppsCreate(environmentDef);
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
