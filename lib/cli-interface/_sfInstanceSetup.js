'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');
const getOperationMode = require('../../lib/cli-api/_common/_getOperationMode');
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
        .option(config.get('cliOptions.operationMode.cli'), config.get('cliOptions.operationMode.description'), getOperationMode, getProgramOptionDefault('operationMode'))
        .description('Attempts to create the B2C Instance CustomerLists and Sites defined in the B2C Commerce environment -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize the command options
            const commandOptions = commandObj.opts();

            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Initialize the output variables
            const output = {};
            let resultObj;

            // Generate the validation results for all dependent attributes
            const sfConnProperties = common.getSFUserCredConnProperties(environmentDef);
            const isJSONOperationMode = commandOptions.operationMode === config.get('operationMode.json');

            try {

                // Open the output display
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'start');
                    console.log(' -- Attempting to authenticate against the configured Salesforce Core Platform instance using the following environment details');
                    cliUi.outputEnvironmentDef(environmentDef);
                }

                // Were any validation errors found with the connection properties?
                if (sfConnProperties.isValid !== true) {
                    cliUi.outputResults(undefined, config.get('errors.sf.badEnvironment'));
                    return commandProgram;
                }

                // Attempt to authenticate against the SF instance leveraging the user credentials
                resultObj = await cliAPI.sfAuthUserCredentials(environmentDef);
                output.sfAuthResults = resultObj;

                if (!isJSONOperationMode) {
                    cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.sfAuthTokenOutput');
                    console.log(' -- Attempt to setup the B2C Instance CustomerList and Site child records in the Salesforce Platform');
                }

                // Attempt to create the sites and customerLists for this instance
                resultObj = await cliAPI.sfB2CInstanceSetup(environmentDef, output.sfAuthResults.apiCalls.sfAuthenticate.authResults);
                output.sfSetupB2CInstance = resultObj;

                if (!isJSONOperationMode) {
                    cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.b2cInstanceSetup');
                    console.log(' -- Apply the configured B2C ClientID to each configured B2C CustomerList in the Salesforce Platform');
                }

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

                    // Capture the output results
                    output.customerListsUpdated.push(output.customerListUpdateResult);

                }

                if (!isJSONOperationMode) {
                    console.log(' -- Apply the configured B2C ClientID to each configured B2C Site in the Salesforce Platform');
                }

                // Loop over the collection of sites and apply the clientId
                for (let thisSite of output.sfSetupB2CInstance.sites) {

                    // Map the B2C ClientID to each of the identified sites
                    output.siteUpdateResult = await sObjectAPIs.update(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn, 'B2C_Site__c', {
                            Id: thisSite.Id,
                            B2C_Client_ID__c: environmentDef.b2cClientId
                        });

                    // Capture the output results
                    output.sitesUpdated.push(output.siteUpdateResult);

                }

            } catch (e) {

                // Output any errors that are caught
                cliUi.outputResults(undefined, JSON.stringify(e, null, 4));

            } finally {

                // Close the bookend comment
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'end');
                }

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
