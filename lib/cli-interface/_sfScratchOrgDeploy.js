/* eslint-disable max-len */
'use strict';

// Initialize module dependencies
const config = require('config');
const logo = require('asciiart-logo');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const commonFs = require('../../lib/_common/fs');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');
const fsLib = require('../../lib/_common/fs');

/**
 * @function deployToScratchOrg
 * @description This function is used to initially deploy code to a sfdx scratch org using a configured profile.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:deploy')
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

                // Open the bookend and output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to deploy b2c-crm-sync using the following environment details');
                validationResults = cliUi.outputEnvironmentDef(environmentDef);

                // Evaluate the validation results and exit early if we find an error
                Object.keys(validationResults).forEach(thisKey => {
                    if (validationResults[thisKey].validationResult === false) { hasError = true; }
                });

                // Was a validation-error found?  If so, exit early
                if (hasError === true) {

                    // Output messaging to provide context regarding why the build is failing
                    console.log(' -- Unable to begin b2c-crm-sync deployment to the Salesforce Platform deployment');
                    console.log(' -- Your .env has at least one (1) configuration error; please review the validation errors above');
                    console.log(' -- and correct them.  Your .env configuration must validate successfully with zero errors in');
                    console.log(' -- order to create a scratchOrg and deploy b2c-crm-sync to it.');

                    // Exit early
                    return commandProgram;

                }

                // Create the certificates folder(s) -- if they do not exist
                console.log(' -- verifying / creating the certificates directory');
                await fsLib.verifyAndCreateFolder(config.get('paths.source.dx.certs-root'), true);
                await fsLib.verifyAndCreateFolder(config.get('paths.source.dx.certs-sfdc'), true);

                // Open the bookend and output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to deploy b2c-crm-sync to the Salesforce Org using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Retrieve the scratch org details
                resultObj = await cliAPI.sfScratchOrgDetails(environmentDef);
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDetails');

                // Capture the scratch org status
                const localCommandOpts = environmentDef;
                localCommandOpts.statusLocal = true;
                localCommandOpts.statusRemote = false;
                resultObj = await cliAPI.sfScratchOrgStatus(localCommandOpts);
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDeployResults');

                // Render the trustedSites templates
                console.log(' -- creating the trusted sites file; please standby');
                resultObj = await cliAPI.sfTrustedSitesCreate(environmentDef);
                console.log(' -- Trusted sites file generated');
                cliUi.outputTemplateResults(resultObj, undefined, config.get('operationMode.default'), false);

                // Render the remoteSiteSettings template
                console.log(' -- creating the remote site settings file; please standby');
                resultObj = await cliAPI.sfRemoteSitesCreate(environmentDef);
                console.log(' -- Remote site settings file generated');
                cliUi.outputTemplateResults(resultObj, undefined, config.get('operationMode.default'), false);

                // Render the clientCredentials grant Named Credentials template
                console.log(' -- creating the "Order On Behalf" Named Credentials file; please standby');
                await commonFs.verifyAndCreateFolder(`${config.get('paths.source.dx.base')}namedCredentials`);
                environmentDef.dontClearNamedCredentialsFolder = true;

                // Render the OOBO Named Credentials template
                resultObj = await cliAPI.sfNamedCredentialsOOBOCreate(environmentDef);
                console.log(' -- "Order On Behalf" Named Credentials file generated');
                cliUi.outputTemplateResults(resultObj, undefined, config.get('operationMode.default'), false);

                // Render the ConnectedApp templates
                console.log(' -- creating the connected apps file; please standby');
                resultObj = await cliAPI.sfConnectedAppsCreate(environmentDef);
                console.log(' -- Connected apps file(s) generated for the following sites');
                cliUi.outputResults(resultObj.outputDisplay.verifySites.success, undefined, 'cliTableConfig.siteOutput');
                resultObj.outputDisplay.siteIds.filter(
                    site => resultObj.outputDisplay.siteTemplateResults.hasOwnProperty(site))
                    .forEach(site => cliUi.outputTemplateResults(
                        resultObj.outputDisplay.siteTemplateResults[site],
                        undefined, config.get('operationMode.default'), false)
                    );

                // Deploy the b2c-crm-sync code the scratchOrg
                console.log(' -- deploying the base meta-data to the specified scratch org; please standby');
                resultObj = await cliAPI.sfScratchOrgPush(environmentDef);
                console.log(' -- b2c-crm-sync base meta-data deployed to the scratch org');

                // Is a personAccount scratchOrg deployment underway?
                if (environmentDef.sfScratchOrgProfile === config.get('sfScratchOrg.paProfile')) {

                    console.log(' -- deploying the personAccount meta-data to the specified scratch org; please standby');
                    resultObj = await cliAPI.sfScratchOrgDeploy(environmentDef, config.get('paths.source.dx.personaccounts'));
                    console.log(' -- b2c-crm-sync personAccount meta-data deployed to the scratch org');

                }

                // Assign the default b2c-crm-sync permissionSet to the core user
                resultObj = await cliAPI.sfUserPermsetAssign(environmentDef, config.get('sfScratchOrg.syncPermSetName'));
                console.log(' -- assigned the B2C-CRM-Sync permissionSet to the active user');

                // Assign the default b2c-crm-jwt permissionSet to the core user
                resultObj = await cliAPI.sfUserPermsetAssign(environmentDef, config.get('sfScratchOrg.jwtPermSetName'));
                console.log(' -- assigned the B2C-CRM-Jwt permissionSet to the active user');

                // Reset the user's password
                resultObj = await cliAPI.sfUserPasswordReset(environmentDef);
                console.log(' -- reset the password for the scratchOrg user');

                // Display the user details
                resultObj = await cliAPI.sfUserDetails(environmentDef);
                console.log(' -- Updated user details (with the newly generated password)');
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDetails');
                cliUi.outputSFUserDetails(resultObj);

                // Define the status properties used to render the scratchOrg status
                localCommandOpts.statusLocal = false;
                localCommandOpts.statusRemote = true;

                // Retrieve the scratchOrg status
                resultObj = await cliAPI.sfScratchOrgStatus(localCommandOpts);
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDeployResults');

                // Print the output in case of JSON mode, which is an aggregate of all the subsequent results
                console.log(logo({
                    name: 'SUCCESS!',
                    font: 'Electronic',
                    lineChars: 10,
                    padding: 2,
                    margin: 2,
                    borderColor: 'black',
                    logoColor: 'bold-green',
                    textColor: 'green'
                })
                    .emptyLine()
                    .right('- Brought to You by the Full Power of Salesforce Architects')
                    .right('Architect Success, SCPPE, Services, & Alliances')
                    .emptyLine()
                    .render()
                );

            } catch (e) {

                console.log(
                    logo({
                        name: 'FAILED!',
                        font: 'Electronic',
                        lineChars: 10,
                        padding: 2,
                        margin: 2,
                        borderColor: 'black',
                        logoColor: 'bold-red',
                        textColor: 'red'
                    })
                        .emptyLine()
                        .right('- Errors occurred while creating the Salesforce ScratchOrg ')
                        .right('- Inspect each of the following exceptions reported by SFDX')
                        .right('Validate your MetaData, OrgProfile, and Try Again')
                        .emptyLine()
                        .render()
                );

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
