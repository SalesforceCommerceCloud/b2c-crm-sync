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
        .requiredOption(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
        )
        .requiredOption(
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .requiredOption(
            config.get('cliOptions.b2cClientId.cli'),
            config.get('cliOptions.b2cClientId.description'),
            getProgramOptionDefault('b2cClientId')
        )
        .requiredOption(
            config.get('cliOptions.b2cClientSecret.cli'),
            config.get('cliOptions.b2cClientSecret.description'),
            getProgramOptionDefault('b2cClientSecret')
        )
        .requiredOption(
            config.get('cliOptions.b2cUsername.cli'),
            config.get('cliOptions.b2cUsername.description'),
            getProgramOptionDefault('b2cUsername')
        )
        .requiredOption(
            config.get('cliOptions.b2cAccessKey.cli'),
            config.get('cliOptions.b2cAccessKey.description'),
            getProgramOptionDefault('b2cAccessKey')
        )
        .option(
            config.get('cliOptions.b2cInstanceName.cli'),
            config.get('cliOptions.b2cInstanceName.description'),
            getProgramOptionDefault('b2cInstanceName')
        )
        .description('Generate the SFDX templates (trustedSites, remoteSiteSettings, and namedCredentials) ' +
            'deployment metadata -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Initialize local variables
            let output = {};

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Generate the meta-data template definitions using the following environment details',
                    environmentDef);

                // Create the trusted sites
                output.trustedSitesCreateResults = await cliAPI.sfTrustedSitesCreate(environmentDef);
                console.log(' -- Trusted sites template file generated');
                cliUi.outputTemplateResults(output.trustedSitesCreateResults, undefined);

                // Create the remote sites settings
                output.remoteSitesCreateResults = await cliAPI.sfRemoteSitesCreate(environmentDef);
                console.log(' -- Remote site settings template file generated');
                cliUi.outputTemplateResults(output.remoteSitesCreateResults, undefined);

                // Create the OOBO named credentials
                output.ncOOBOCreateResults = await cliAPI.sfNamedCredentialsOOBOCreate(environmentDef);
                console.log(' -- "Order On Behalf" Named Credentials template file generated');
                cliUi.outputTemplateResults(output.ncOOBOCreateResults, undefined);

                // Create the connected apps
                output.connectedAppCreateResults = await cliAPI.sfConnectedAppsCreate(environmentDef);
                console.log(' -- Connected apps template file(s) generated for the following sites');
                cliUi.outputResults(
                    output.connectedAppCreateResults.outputDisplay.verifySites.success,
                    undefined,
                    'cliTableConfig.siteOutput');

                // Output the connectedApp creation results
                output.connectedAppCreateResults.outputDisplay.siteIds
                    .filter(site =>
                        output.connectedAppCreateResults.outputDisplay.siteTemplateResults.hasOwnProperty(site)
                    )
                    .forEach(site => cliUi.outputTemplateResults(
                        output.connectedAppCreateResults.outputDisplay.siteTemplateResults[site])
                    );

            } catch (e) {

                cliUi.outputTemplateResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
