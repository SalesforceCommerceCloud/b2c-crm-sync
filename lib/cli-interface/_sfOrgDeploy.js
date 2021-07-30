/* eslint-disable max-len,no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const commonFs = require('../../lib/_common/fs');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');
const fsLib = require('../../lib/_common/fs');

/**
 * @function deployToSalesforceOrg
 * @description This function is used to initially deploy code to a sfdx salesforce org using a configured profile.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:deploy')
        .option(
            config.get('cliOptions.b2cInstanceName.cli'),
            config.get('cliOptions.b2cInstanceName.description'),
            getProgramOptionDefault('b2cInstanceName')
        )
        .option(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
        )
        .option(
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .option(
            config.get('cliOptions.b2cClientId.cli'),
            config.get('cliOptions.b2cClientId.description'),
            getProgramOptionDefault('b2cClientId')
        )
        .option(
            config.get('cliOptions.b2cClientSecret.cli'),
            config.get('cliOptions.b2cClientSecret.description'),
            getProgramOptionDefault('b2cClientSecret')
        )
        .option(
            config.get('cliOptions.b2cUsername.cli'),
            config.get('cliOptions.b2cUsername.description'),
            getProgramOptionDefault('b2cUsername')
        )
        .option(
            config.get('cliOptions.b2cAccessKey.cli'),
            config.get('cliOptions.b2cAccessKey.description'),
            getProgramOptionDefault('b2cAccessKey')
        )
        .option(
            config.get('cliOptions.sfLoginUrl.cli'),
            config.get('cliOptions.sfLoginUrl.description'),
            getProgramOptionDefault('sfLoginUrl')
        )
        .option(
            config.get('cliOptions.sfScratchOrgProfile.cli'),
            config.get('cliOptions.sfScratchOrgProfile.description'),
            getProgramOptionDefault('sfScratchOrgProfile')
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
        .description('Deploy SFDC b2c-crm-sync code to the specified Salesforce org via the CLI -- defaults to the .env')
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
                    'Attempting to deploy b2c-crm-sync using the following environment details',
                    environmentDef);

                // Evaluate the validation results and exit early if we find an error
                validationResults = cliUi.outputEnvironmentDef(environmentDef);
                Object.keys(validationResults).forEach(thisKey => {
                    if (validationResults[thisKey].validationResult === false) { hasError = true; }
                });

                // Was a validation-error found?  If so, exit early
                if (hasError === true) {

                    // Output messaging to provide context regarding why the build is failing
                    console.log(' -- Unable to begin b2c-crm-sync deployment to the Salesforce Platform deployment');
                    console.log(' -- Your .env has at least one (1) configuration error; please review these validation errors');
                    console.log(' -- and correct them.  Your .env configuration must validate successfully with zero errors');
                    console.log(' -- in order to deploy b2c-crm-sync to a Salesforce org.');

                    // Throw an error to exit early (calling out that the configuration has validation errors)
                    throw new Error('Unable to deploy to the Salesforce Org; please check your configuration -- and try again');

                }

                // Default the base deployment path
                const deployBasePath = `${config.get('paths.source.dx.base')}${config.get('paths.source.dx.deployPath')}`;
                const deployPAPath = `${config.get('paths.source.dx.personaccounts')}${config.get('paths.source.dx.deployPath')}`;

                // Create the certificates folder(s) -- if they do not exist
                console.log(' -- verifying / creating the certificates directory');
                await fsLib.verifyAndCreateFolder(config.get('paths.source.dx.certs-root'), true);
                await fsLib.verifyAndCreateFolder(config.get('paths.source.dx.certs-sfdc'), true);
                await fsLib.verifyAndCreateFolder(`${deployBasePath}certs`, false);

                // Purge the contents of the directories where we generate content (clear out these folders)
                await fsLib.verifyAndCreateFolder(`${deployBasePath}connectedApps`, false);
                await fsLib.verifyAndCreateFolder(`${deployBasePath}cspTrustedSites`, false);
                await fsLib.verifyAndCreateFolder(`${deployBasePath}duplicateRules`, false);
                await fsLib.verifyAndCreateFolder(`${deployPAPath}duplicateRules`, false);
                await fsLib.verifyAndCreateFolder(`${deployBasePath}namedCredentials`, false);
                await fsLib.verifyAndCreateFolder(`${deployBasePath}remoteSiteSettings`, false);

                // Open the bookend and output the environment details
                // eslint-disable-next-line no-underscore-dangle
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to deploy b2c-crm-sync to the Salesforce Org using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Retrieve the org details
                resultObj = await cliAPI.sfOrgDetails(environmentDef);
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
                await commonFs.verifyAndCreateFolder(`${deployBasePath}namedCredentials`);
                environmentDef.dontClearNamedCredentialsFolder = true;

                // Render the OOBO Named Credentials template
                resultObj = await cliAPI.sfNamedCredentialsOOBOCreate(environmentDef);
                console.log(' -- "Order On Behalf" Named Credentials file generated');
                cliUi.outputTemplateResults(resultObj, undefined);

                // Deploy the b2c-crm-sync code the salesforceOrg
                console.log(' -- deploying the base meta-data to the specified Salesforce Org; please standby');
                resultObj = await cliAPI.sfOrgDeploy(environmentDef, config.get('paths.source.dx.base'));
                console.log(' -- b2c-crm-sync base meta-data deployed to the Salesforce Org');

                // ------------------------------------------------------------------------
                // PersonAccount MetaData Deployment: BEGIN
                // ------------------------------------------------------------------------

                // Is a personAccount deployment underway?
                if (environmentDef.sfScratchOrgProfile === config.get('sfScratchOrg.paProfile')) {

                    console.log(' -- deploying the personAccount meta-data to the specified Salesforce Org; please standby');
                    resultObj = await cliAPI.sfOrgDeploy(environmentDef, config.get('paths.source.dx.personaccounts'));
                    console.log(' -- b2c-crm-sync personAccount meta-data deployed to the Salesforce Org');

                }

                // ------------------------------------------------------------------------
                // PersonAccount MetaData Deployment: END
                // ------------------------------------------------------------------------

                // Assign the default b2c-crm-sync permissionSet to the core user
                resultObj = await cliAPI.sfUserPermsetAssign(environmentDef, config.get('sfScratchOrg.syncPermSetName'));
                console.log(' -- assigned the B2C-CRM-Sync permissionSet to the active user');

                // Assign the default b2c-crm-jwt permissionSet to the core user
                resultObj = await cliAPI.sfUserPermsetAssign(environmentDef, config.get('sfScratchOrg.jwtPermSetName'));
                console.log(' -- assigned the B2C-CRM-Jwt permissionSet to the active user');

                // Display the user details
                resultObj = await cliAPI.sfUserDetails(environmentDef);
                console.log(' -- Current active user details for this Salesforce Org');
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDetails');
                cliUi.outputSFUserDetails(resultObj);

                // Output the scratchOrg details
                cliUi.outputResults(
                    resultObj.outputDisplay,
                    undefined,
                    'cliTableConfig.scratchOrgResults');

                // Output the success message
                cliUi.outputResults();

                // Open the scratch Org
                console.log(' -- opening the Salesforce org; please standby');
                resultObj = await cliAPI.sfOrgOpen(environmentDef);

                // Display the orgUrl
                console.log(resultObj.result.url);

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                // eslint-disable-next-line no-underscore-dangle
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

            // Return the program with the appended command
            return commandProgram;

        });

    // Return the program with the appended command
    return commandProgram;
};
