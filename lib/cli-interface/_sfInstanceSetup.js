'use strict';

// Initialize module dependencies
const config = require('config');
const logo = require('asciiart-logo');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');
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
        .requiredOption(config.get('cliOptions.sfHostName.cli'), config.get('cliOptions.sfHostName.description'), getProgramOptionDefault('sfHostName'))
        .requiredOption(config.get('cliOptions.sfLoginUrl.cli'), config.get('cliOptions.sfLoginUrl.description'), getProgramOptionDefault('sfLoginUrl'))
        .requiredOption(config.get('cliOptions.sfUsername.cli'), config.get('cliOptions.sfUsername.description'), getProgramOptionDefault('sfUsername'))
        .requiredOption(config.get('cliOptions.sfPassword.cli'), config.get('cliOptions.sfPassword.description'), getProgramOptionDefault('sfPassword'))
        .requiredOption(config.get('cliOptions.sfSecurityToken.cli'), config.get('cliOptions.sfSecurityToken.description'), getProgramOptionDefault('sfSecurityToken'))
        .requiredOption(config.get('cliOptions.b2cInstanceName.cli'), config.get('cliOptions.b2cInstanceName.description'), getProgramOptionDefault('b2cInstanceName'))
        .requiredOption(config.get('cliOptions.b2cClientId.cli'), config.get('cliOptions.b2cClientId.description'), getProgramOptionDefault('b2cClientId'))
        .description('Attempts to create the B2C Instance CustomerLists and Sites defined in the B2C Commerce environment -- defaults to the .env; can be overridden via the CLI')
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
                namedCredentialName;

            // Build out the namedCredential name for OOBO
            namedCredentialName = environmentDef.b2cInstanceName + config.get('b2c.ooboNamedCredentialSuffix');

            try {

                // Open the output display
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to authenticate against the configured Salesforce Core Platform instance using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Were any validation errors found with the connection properties?
                if (sfConnProperties.isValid !== true) {
                    cliUi.outputResults(undefined, config.get('errors.sf.badEnvironment'));
                    return commandProgram;
                }

                // Attempt to authenticate against the SF instance leveraging the user credentials
                resultObj = await cliAPI.sfAuthUserCredentials(environmentDef);
                output.sfAuthResults = resultObj;

                // Display the user-credential authentication results
                cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.sfAuthTokenOutput');
                console.log(' -- Attempt to setup the B2C Instance and related records in the Salesforce Platform');

                // Validate that the B2C Instance exists
                resultObj = await cliAPI.sfB2CInstanceGet(environmentDef);

                // Was an instance verified?
                if (resultObj !== undefined) {

                    // Output that the instance was verified
                    console.log(' -- B2C Instance verified; updating the with the environment details');

                } else {

                    // Create the initial B2C Instance record in the scratchOrg
                    resultObj = await cliAPI.sfB2CInstanceCreate(environmentDef);
                    console.log(' -- B2C Instance seed-record created using environment properties');

                }

                // Update the initial B2C Instance record in the org
                await cliAPI.sfB2CInstanceUpdate(environmentDef);
                console.log(' -- B2C Instance seed-record updated using environment properties');

                // Attempt to create the sites and customerLists for this instance
                resultObj = await cliAPI.sfB2CInstanceSetup(environmentDef, output.sfAuthResults.apiCalls.sfAuthenticate.authResults);
                output.sfSetupB2CInstance = resultObj;

                // Display the B2C Instance initialization setup results
                cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.b2cInstanceSetup');

                // Was an error thrown during the b2cInstance processing? If so, throw the error
                if (output.sfSetupB2CInstance.data.outputValues.success === false) {
                    throw (output.sfSetupB2CInstance.data.outputValues.errorMessage);
                }

                // Announce that we're now applying the B2C ClientID to the related customerList / site records
                console.log(' -- Apply the configured B2C ClientID to each B2C CustomerList in the Salesforce Platform');

                // Initialize the update collections
                output.customerListsUpdated = [];
                output.sitesUpdated = [];

                // Loop over the collection of customerLists and apply the clientId
                for (let thisCustomerList of output.sfSetupB2CInstance.customerLists) {

                    // Map the B2C ClientID to each of the identified customerLists
                    output.customerListUpdateResult = await sObjectAPIs.update(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn, 'B2C_CustomerList__c', {
                            Id: thisCustomerList.Id,
                            B2C_Client_ID__c: environmentDef.b2cClientId
                        });

                    // Did an error occur processing the customerList update?
                    if (output.customerListUpdateResult.success === false) {
                        throw (output.customerListUpdateResult.errors);
                    }

                    // Capture the output results
                    output.customerListsUpdated.push(output.customerListUpdateResult);

                }

                // Alert that we're now processing the B2C Client ID and Named Credential updates
                console.log(' -- Apply the configured B2C ClientID and OOBO NamedCredential to each B2C Site in the Salesforce Platform');

                // Loop over the collection of sites and apply the clientId / namedCredential
                for (let thisSite of output.sfSetupB2CInstance.sites) {

                    // Map the B2C ClientID to each of the identified sites
                    output.siteUpdateResult = await sObjectAPIs.update(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn, 'B2C_Site__c', {
                            Id: thisSite.Id,
                            OOBO_Named_Credential_Developer_Name__c: namedCredentialName,
                            B2C_Client_ID__c: environmentDef.b2cClientId
                        });

                    // Did an error occur processing the customerList update?
                    if (output.siteUpdateResult.success === false) {
                        throw (output.siteUpdateResult.errors);
                    }

                    // Capture the output results
                    output.sitesUpdated.push(output.siteUpdateResult);

                }

                // Output the success message
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
                        .right('- Errors occurred when creating the Salesforce B2C Instance')
                        .right('- Inspect each of the following exceptions reported by SFDX')
                        .right('Validate your MetaData, OrgProfile, and Try Again')
                        .emptyLine()
                        .render()
                );

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
