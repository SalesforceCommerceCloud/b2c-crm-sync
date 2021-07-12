/* eslint-disable no-underscore-dangle */
// noinspection LocalVariableNamingConventionJS,AnonymousFunctionJS,ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function _dxInstanceSetup
 * @description This function is used to setup a B2C Instance using the customerList and site
 * definitions that exist in B2C Commerce.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:b2cinstance:setup')
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
            config.get('cliOptions.sfCertDeveloperName.cli'),
            config.get('cliOptions.sfCertDeveloperName.description'),
            getProgramOptionDefault('sfCertDeveloperName')
        )
        .requiredOption(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
        )
        .requiredOption(
            config.get('cliOptions.b2cInstanceName.cli'),
            config.get('cliOptions.b2cInstanceName.description'),
            getProgramOptionDefault('b2cInstanceName')
        )
        .requiredOption(
            config.get('cliOptions.b2cClientId.cli'),
            config.get('cliOptions.b2cClientId.description'),
            getProgramOptionDefault('b2cClientId')
        )
        .requiredOption(
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .description('Attempts to create the B2C Instance CustomerLists and Sites defined in the B2C Commerce' +
            ' environment -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize the command options
            const commandOptions = commandObj.opts();

            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Initialize the output variables
            const output = {};

            // Generate the validation results for all dependent attributes
            const sfConnProperties = common.getSFUserCredConnProperties(environmentDef);

            // Initialize local variables
            let resultObj,
                b2cClientId,
                b2cInstanceId,
                b2cClientIDLink,
                b2cInstanceLink,
                b2cSiteLink,
                namedCredentialName;

            // Build out the namedCredential name for OOBO
            namedCredentialName = environmentDef.b2cInstanceName + config.get('b2c.ooboNamedCredentialSuffix');

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to create or default the B2C Instance record in the Salesforce Platform',
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    sfConnProperties,
                    config.get('errors.sf.badEnvironment'));

                // Are the SF authCredentials valid and usable?
                output.sfAuthResults = await cliUi.validateSFAuth(environmentDef);

                // -------------------------------------------------------------
                // Attempt to verify the B2C Client ID record
                // -------------------------------------------------------------

                // Validate that the B2C Client ID exists
                output.b2cClientIDVerifyResults = await cliAPI.sfB2CClientIDGet(
                    output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                    environmentDef);

                // Did an error occur with the validation?
                if (output.b2cClientIDVerifyResults.status === false ||
                    (output.b2cClientIDVerifyResults.success === true && output.b2cClientIDVerifyResults.totalSize === 0)) {

                    // If an error occurred -- call out that we need the B2C Client ID before creating the B2C Instance
                    throw new Error('Unable to verify the B2C Client ID; please ensure this record is created before' +
                        'attempting to create the default B2C Instance');

                }

                // Audit the B2C ClientID value that was retrieved; we have to associate
                // this to the B2C Instance that we'll create now
                b2cClientId = output.b2cClientIDVerifyResults.records[0].Id;

                // Audit that we were found the B2C Client ID -- and now we can proceed to processing the instance
                console.log(` -- Verified that a B2C Client ID exists [${b2cClientId}]`);

                // Audit that the B2C Client ID was updated / reset to its default values
                b2cClientIDLink = `https://${environmentDef.sfHostName}/lightning/r/B2C_Client_ID__c/${b2cClientId}/view`;
                console.log(` -- ${b2cClientIDLink}`);
                console.log('');

                console.log(' -- Verifying that a B2C Instance record exists in the Salesforce Platform');

                // -------------------------------------------------------------
                // Attempt to create the B2C Instance record
                // -------------------------------------------------------------

                // Validate that the B2C Instance exists
                output.b2cInstanceVerifyResults = await cliAPI.sfB2CInstanceGet(
                    output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                    environmentDef);

                // If an error occurred -- call out that we were unable to verify the B2C Instance
                if (output.b2cInstanceVerifyResults.success === false) {
                    throw new Error('Unable to verify the B2C Instance record; please check your configuration');
                }

                // Was a B2C Instance record found? If not, let's create one
                if (output.b2cInstanceVerifyResults.success === true && output.b2cInstanceVerifyResults.totalSize === 0) {

                    // Audit that we were not able to verify the B2C Instance and are now creating it
                    console.log(' -- Verified that the default B2C Instance does not exist; creating the default record');

                    // Attempt to create the B2C Instance definition
                    output.b2cInstanceCreateResults = await cliAPI.sfB2CInstanceCreate(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                        environmentDef,
                        b2cClientId
                    );

                    // Audit the B2C Instance value that was created
                    b2cInstanceId = output.b2cInstanceCreateResults.id;

                    // Audit that the record was created and capture the B2C Instance
                    console.log(` -- Successfully created the default B2C Instance record [${b2cInstanceId}]`);

                // Otherwise, verify that the record was created -- and update the record to reset it as a default
                } else if (output.b2cInstanceVerifyResults.success === true && output.b2cInstanceVerifyResults.totalSize === 1) {

                    // Audit the B2C Instance value that was retrieved
                    b2cInstanceId = output.b2cInstanceVerifyResults.records[0].Id;

                    // Audit that the record was created and capture the B2C Instance
                    console.log(` -- Verified the default B2C Instance exists [${b2cInstanceId}]; resetting default values`);

                    // Attempt to update / reset the B2C Instance definition
                    output.b2cInstanceUpdateResults = await cliAPI.sfB2CInstanceUpdate(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                        environmentDef,
                        b2cClientId,
                        b2cInstanceId
                    );

                    // Did an error occur with the update?
                    if (output.b2cInstanceUpdateResults.status === false) {
                        throw new Error('Unable to update / default the B2C Instance; please try again');
                    }

                    // Audit that the B2C Client ID was updated / reset to its default values
                    console.log(` -- Successfully reset the B2C Instance to its default values [${b2cInstanceId}]`);

                }

                // Audit that the B2C Client ID was updated / reset to its default values
                b2cInstanceLink = `https://${environmentDef.sfHostName}/lightning/r/B2C_Instance__c/${b2cInstanceId}/view`;
                console.log(` -- ${b2cInstanceLink}`);

                // -------------------------------------------------------------
                // Attempt to Seed the B2C Instance CustomerLists and Sites
                // -------------------------------------------------------------

                // Audit that we're now seeding customerLists and Sites for the instance
                console.log(' -- Seeding B2C CustomerLists and Sites for this B2C Instance in the Salesforce Org');

                // Attempt to create the sites and customerLists for this instance
                resultObj = await cliAPI.sfB2CInstanceSetup(
                    environmentDef,
                    output.sfAuthResults.apiCalls.sfAuthenticate.authResults);

                // Define the output details
                output.sfSetupB2CInstance = resultObj;

                // Display the B2C Instance initialization setup results
                cliUi.outputResults(
                    resultObj.outputDisplay,
                    undefined,
                    'cliTableConfig.b2cInstanceSetup');

                // Was an error thrown during the b2cInstance processing? If so, throw the error
                if (output.sfSetupB2CInstance.data.outputValues.success === false) {
                    throw new Error(output.sfSetupB2CInstance.data.outputValues.errorMessage);
                }

                // Alert that we're now processing the B2C Client ID and Named Credential updates
                console.log(' -- Apply the OOBO NamedCredential to each B2C Site in the Salesforce Platform');

                // Initialize the sitesUpdated tracking-variable
                output.sitesUpdated = [];

                // Loop over the collection of sites and apply the clientId / namedCredential
                for (let thisSite of output.sfSetupB2CInstance.sites) {

                    console.log(` -- Applying the OOBO NamedCredential to site ${thisSite.Name} [${thisSite.Id}]`);
                    b2cSiteLink = `https://${environmentDef.sfHostName}/lightning/r/B2C_Site__c/${thisSite.Id}/view`;
                    console.log(` -- ${b2cSiteLink}`);

                    // Map the B2C ClientID to each of the identified sites
                    output.siteUpdateResult = await sObjectAPIs.update(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn, 'B2C_Site__c', {
                            Id: thisSite.Id,
                            OOBO_Named_Credential_Developer_Name__c: namedCredentialName
                        });

                    // Did an error occur processing the customerList update?
                    if (output.siteUpdateResult.success === false) {
                        throw new Error(output.siteUpdateResult.errors);
                    }

                    // Capture the output results
                    output.sitesUpdated.push(output.siteUpdateResult);

                }

                // Output the success message
                cliUi.outputResults();

            } catch (e) {

                // Output any errors that are caught
                cliUi.outputResults(undefined, e);

            } finally {

                // Close the bookend comment
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
