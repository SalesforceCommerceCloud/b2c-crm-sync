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
/**
 * @function sfAuthProviderBuild
 * @description This function is used to automate the creation of the auth provider and the related named credential, as this requires an already set up user on the core instance
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:authprovider:build')
        .requiredOption(config.get('cliOptions.b2cHostName.cli'), config.get('cliOptions.b2cHostName.description'), getProgramOptionDefault('b2cHostName'))
        .requiredOption(config.get('cliOptions.b2cClientId.cli'), config.get('cliOptions.b2cClientId.description'), getProgramOptionDefault('b2cClientId'))
        .requiredOption(config.get('cliOptions.b2cClientSecret.cli'), config.get('cliOptions.b2cClientSecret.description'), getProgramOptionDefault('b2cClientSecret'))
        .requiredOption(config.get('cliOptions.b2cInstanceName.cli'), config.get('cliOptions.b2cInstanceName.description'), getProgramOptionDefault('b2cInstanceName'))
        .requiredOption(config.get('cliOptions.sfHostName.cli'), config.get('cliOptions.sfHostName.description'), getProgramOptionDefault('sfHostName'))
        .requiredOption(config.get('cliOptions.sfLoginUrl.cli'), config.get('cliOptions.sfLoginUrl.description'), getProgramOptionDefault('sfLoginUrl'))
        .requiredOption(config.get('cliOptions.sfUsername.cli'), config.get('cliOptions.sfUsername.description'), getProgramOptionDefault('sfUsername'))
        .requiredOption(config.get('cliOptions.sfPassword.cli'), config.get('cliOptions.sfPassword.description'), getProgramOptionDefault('sfPassword'))
        .requiredOption(config.get('cliOptions.sfSecurityToken.cli'), config.get('cliOptions.sfSecurityToken.description'), getProgramOptionDefault('sfSecurityToken'))
        .description('Create auth provider and its related named credentials on the target core instance via the CLI -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Initialize local variables
            let resultObj;

            try {

                // Output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to create the auth provider and its related named credentials using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Render the clientCredentials grant Named Credentials template
                console.log(' -- creating the "Account Manager" Named Credentials file; please standby');
                await commonFs.verifyAndCreateFolder(`${config.get('paths.source.dx.force-app')}namedCredentials`);
                environmentDef.dontClearNamedCredentialsFolder = true;

                // Create the Account Manager namedCredential
                resultObj = await cliAPI.sfNamedCredentialsAMCreate(environmentDef);
                console.log(' -- "Account Manager" Named Credentials file generated');
                cliUi.outputTemplateResults(resultObj, undefined, config.get('operationMode.default'), false);

                console.log(' -- deploying the created named credentials meta-data to the specified core org; please standby');
                await cliAPI.sfScratchOrgDeploy(environmentDef, resultObj.filePath);
                console.log(' -- "Account Manager" named credential deployed');

                // Output the success message for the authProvider creation
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
                        .right('- Errors occurred creating the Salesforce AuthProvider     ')
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
