/* eslint-disable no-underscore-dangle,max-len */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const commonFs = require('../../lib/_common/fs');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');
const fsLib = require('../../lib/_common/fs');

/**
 * @function sfScratchOrgBuild
 * @description This function is used to automate the creation, build, and deployment of a scratch org.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:build')
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
        .requiredOption(
            config.get('cliOptions.b2cInstanceName.cli'),
            config.get('cliOptions.b2cInstanceName.description'),
            getProgramOptionDefault('b2cInstanceName')
        )
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
            config.get('cliOptions.sfScratchOrgUsername.cli'),
            config.get('cliOptions.sfScratchOrgUsername.description'),
            getProgramOptionDefault('sfScratchOrgUsername')
        )
        .option(
            config.get('cliOptions.sfScratchOrgForceOverwrite.cli'),
            config.get('cliOptions.sfScratchOrgForceOverwrite.description'),
            getProgramOptionDefault('sfScratchOrgForceOverwrite')
        )
        .description('Create a scratch-org, build dxTemplates, and deploy crm-sync code to the' +
            ' scratchOrg via the CLI -- defaults to the .env')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Initialize local variables
            let resultObj,
                hasError,
                validationResults;

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to create a scratch org and deploy b2c-crm-sync using the following environment details',
                    environmentDef);

                // Evaluate the validation results and exit early if we find an error
                validationResults = cliUi.outputEnvironmentDef(environmentDef);
                Object.keys(validationResults).forEach(thisKey => {
                    if (validationResults[thisKey].validationResult === false) { hasError = true; }
                });

                // Was a validation-error found?  If so, exit early
                if (hasError === true) {

                    // Output messaging to provide context regarding why the build is failing
                    console.log(' -- Unable to begin scratchOrg creation, build, and b2c-crm-sync Salesforce Platform deployment');
                    console.log(' -- Your .env has at least one (1) configuration error; please review the validation errors above');
                    console.log(' -- and correct them.  Your .env configuration must validate successfully with zero errors in');
                    console.log(' -- order to create a scratchOrg and deploy b2c-crm-sync to it.');

                    // Exit early and throw an error
                    throw new Error('Unable to begin the scratchOrg build process; please check your configuration and try again');

                }

                // Create the certificates folder(s) -- if they do not exist
                console.log(' -- verifying / creating the certificates directory');
                await fsLib.verifyAndCreateFolder(config.get('paths.source.dx.certs-root'), true);
                await fsLib.verifyAndCreateFolder(config.get('paths.source.dx.certs-sfdc'), true);

                // Create the scratch org
                console.log(' -- creating the specified scratch org; please standby');
                resultObj = await cliAPI.sfScratchOrgCreate(environmentDef);

                // Override the environment scratch org username to use the newly created scratch org username for the subsequent requests
                environmentDef.sfScratchOrgUsername = resultObj.result.username;
                console.log(' -- Newly created scratch org details');
                cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.scratchOrgResults');

                // Retrieve the scratch org details
                console.log(' -- getting the details of the newly created scratch org; please standby');
                resultObj = await cliAPI.sfOrgDetails(environmentDef);
                console.log(' -- Scratch org details');
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDetails');

                // Render the trustedSites templates
                console.log(' -- creating the trusted sites file; please standby');
                resultObj = await cliAPI.sfTrustedSitesCreate(environmentDef);
                console.log(' -- Trusted sites file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Render the remoteSiteSettings template
                console.log(' -- creating the remote site settings file; please standby');
                resultObj = await cliAPI.sfRemoteSitesCreate(environmentDef);
                console.log(' -- Remote site settings file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Render the clientCredentials grant Named Credentials template
                console.log(' -- creating the "Order On Behalf" Named Credentials file; please standby');
                await commonFs.verifyAndCreateFolder(
                    `${config.get('paths.source.dx.base')}${config.get('paths.source.dx.deployPath')}namedCredentials`);
                environmentDef.dontClearNamedCredentialsFolder = true;

                // Render the OOBO Named Credentials template
                resultObj = await cliAPI.sfNamedCredentialsOOBOCreate(environmentDef);
                console.log(' -- "Order On Behalf" Named Credentials file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Render the ConnectedApp templates
                console.log(' -- creating the connected apps file; please standby');
                resultObj = await cliAPI.sfConnectedAppsCreate(environmentDef);
                console.log(' -- Connected apps file(s) generated for the following sites');
                cliUi.outputResults(resultObj.outputDisplay.verifySites.success, undefined, 'cliTableConfig.siteOutput');
                resultObj.outputDisplay.siteIds.filter(
                    site => Object.prototype.hasOwnProperty.call(
                        resultObj.outputDisplay.siteTemplateResults, site))
                    .forEach(site => cliUi.outputTemplateResults(
                        resultObj.outputDisplay.siteTemplateResults[site], undefined)
                    );

                // Deploy the b2c-crm-sync code the scratchOrg
                console.log(' -- deploying the base meta-data to the specified scratch org; please standby');
                resultObj = await cliAPI.sfScratchOrgPush(environmentDef);
                console.log(' -- b2c-crm-sync base meta-data deployed to the scratch org');

                // Is a personAccount scratchOrg deployment underway?
                if (environmentDef.sfScratchOrgProfile === config.get('sfScratchOrg.paProfile')) {

                    console.log(' -- deploying the personAccount meta-data to the specified scratch org; please standby');
                    resultObj = await cliAPI.sfOrgDeploy(environmentDef, config.get('paths.source.dx.personaccounts'));
                    console.log(' -- b2c-crm-sync personAccount meta-data deployed to the scratch org');

                }

                // Assign the default permissionSet to the core user
                resultObj = await cliAPI.sfUserPermsetAssign(environmentDef, config.get('sfScratchOrg.syncPermSetName'));
                console.log(' -- assigned the B2C Integration Tools permissionSet to the active user');

                // Reset the user's password
                resultObj = await cliAPI.sfUserPasswordReset(environmentDef);
                console.log(' -- reset the password for the scratchOrg user');

                // Display the user details
                resultObj = await cliAPI.sfUserDetails(environmentDef);
                console.log(' -- Updated user details (with the newly generated password)');

                // Output the scratchOrg details
                cliUi.outputResults(
                    resultObj.outputDisplay,
                    undefined,
                    'cliTableConfig.scratchOrgDetails');

                // Output the userDetails
                cliUi.outputSFUserDetails(resultObj);

                // Define the status properties used to render the scratchOrg status
                environmentDef.statusLocal = false;
                environmentDef.statusRemote = true;

                // Retrieve the scratchOrg details
                console.log(' -- retrieving the scratch org status after the deployment; please standby');
                resultObj = await cliAPI.sfOrgStatus(environmentDef);

                if (resultObj.outputDisplay.length > 0) {
                    console.log(' -- scratch org status');
                    cliUi.outputResults(
                        resultObj.outputDisplay,
                        undefined,
                        'cliTableConfig.scratchOrgDeployResults');
                }

                // Open the scratch Org
                console.log(' -- opening the scratch org; please standby');
                resultObj = await cliAPI.sfOrgOpen(environmentDef);
                console.log(' -- Opened scratch org details');

                // Output the scratchOrg details
                cliUi.outputResults(
                    [resultObj.outputDisplay],
                    undefined,
                    'cliTableConfig.scratchOrgResults');

                // Display the orgUrl
                console.log(` -- Org Url: ${resultObj.result.url}`);

                // Output the success details
                cliUi.outputResults();

            } catch (e) {

                // Output the error details
                cliUi.outputResults(undefined, e);

                // Should scratchOrg deletes automatically be deleted?
                if (config.get('sfScratchOrg.autoDeleteFailures') === true) {

                    // Attempt to delete the current scratchOrg -- since deployment failed
                    console.log(' -- attempting to delete scratchOrg; please standby');
                    await cliAPI.sfScratchOrgDelete(environmentDef);
                    console.log(' -- scratchOrg has been deleted -- as the deployment failed; please try again');

                }

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
