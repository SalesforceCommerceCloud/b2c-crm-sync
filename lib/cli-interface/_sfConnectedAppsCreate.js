/* eslint-disable no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');
const sfdx = require('sfdx-node');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

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
        .requiredOption(
            config.get('cliOptions.sfHostName.cli'),
            config.get('cliOptions.sfHostName.description'),
            getProgramOptionDefault('sfHostName')
        )
        .requiredOption(
            config.get('cliOptions.sfLoginUrl.cli'),
            config.get('cliOptions.sfLoginUrl.description'),
            getProgramOptionDefault('sfLoginUrl')
        )
        .requiredOption(
            config.get('cliOptions.sfUsername.cli'),
            config.get('cliOptions.sfUsername.description'),
            getProgramOptionDefault('sfUsername')
        )
        .requiredOption(
            config.get('cliOptions.sfPassword.cli'),
            config.get('cliOptions.sfPassword.description'),
            getProgramOptionDefault('sfPassword')
        )
        .requiredOption(
            config.get('cliOptions.sfSecurityToken.cli'),
            config.get('cliOptions.sfSecurityToken.description'),
            getProgramOptionDefault('sfSecurityToken')
        )
        .requiredOption(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
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
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .description('Generate the SFDX ConnectedApps deployment metadata representing connectedApps to leverage ' +
            '-- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Initialize local variables
            let output = {};

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to generate connectedApp definitions using the following environment details',
                    environmentDef);

                // Generate the SFDX Connected Apps meta-data template
                const resultObj = await cliAPI.sfConnectedAppsCreate(environmentDef);
                console.log(' -- Connected apps template file(s) generated for the following sites');

                // Display the site-summary details
                cliUi.outputResults(
                    resultObj.outputDisplay.verifySites.success,
                    undefined,
                    'cliTableConfig.siteOutput');

                // Only attempt to create and deploy connectedApps for verified sites
                if (resultObj.siteResults.success.length > 0) {

                    // Display the site-specific details
                    resultObj.outputDisplay.siteIds
                        .filter(site => Object.prototype.hasOwnProperty.call(
                            resultObj.outputDisplay.siteTemplateResults, site))
                        .forEach(site => cliUi.outputTemplateResults(
                            resultObj.outputDisplay.siteTemplateResults[site])
                        );

                    // Audit that we're authenticating against the Salesforce org
                    console.log(' -- Authenticating against the Salesforce Org');

                    // Are the SF authCredentials valid and usable?
                    output.sfAuthResults = await cliUi.validateSFAuth(environmentDef);

                    // Audit that we're checking for existing apps already deployed to the Salesforce Org
                    console.log(' -- Checking for existing b2c-crm-sync ConnectedApps in the Salesforce Org');

                    // Query to determine if connectedApps have been deployed already
                    output.connectedAppResults = await cliAPI.sfConnectedAppsGet(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn);

                    // Were any connectedApps found?
                    if (output.connectedAppResults.totalSize !== 0) {

                        // Audit that a deploy is now underway
                        console.log(' -- Unable to deploy ConnectedApps, as b2c-crm-sync connectedApps already');
                        console.log(' -- exist in the target Salesforce Org.  Please manually delete the connectedApps');
                        console.log(' -- in your Salesforce Org before attempting to deploy these updated definitions');
                        console.log('');
                        console.log(' -- Use this url to view your Salesforce Org\'s configured connectedApps');
                        console.log(` -- https://${environmentDef.sfHostName}/lightning/setup/NavigationMenus/home`);

                    } else {

                        // Audit that a deploy is now underway
                        console.log(' -- Deploying the connectedApp meta-data to the Salesforce Org');

                        // Attempt to deploy the connectedApp meta-data to the Salesforce Org
                        output.deployResults = await sfdx.force.source.deploy({
                            metadata: 'ConnectedApp'
                        });

                        // Output the url where connectedApp details can be viewed in the Salesforce Org
                        console.log(' -- Use this url to view your Salesforce Org\'s configured connectedApps');
                        console.log(` -- https://${environmentDef.sfHostName}/lightning/setup/NavigationMenus/home`);

                    }

                }

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
