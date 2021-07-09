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
        .command('crm-sync:sf:b2cclientid:setup')
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
            config.get('cliOptions.b2cClientId.cli'),
            config.get('cliOptions.b2cClientId.description'),
            getProgramOptionDefault('b2cClientId')
        )
        .description('Attempts to create the default B2C Client ID that will be used to ' +
            ' drive authentication with the B2C Commerce Account Manager -- defaults to ' +
            'the .env; can be overridden via the CLI')
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
                b2cClientId;

            try {

                // Open the output display
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to authenticate against the configured Salesforce Platform ' +
                    'instance using the following environment details');
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
                console.log(' -- Attempt to setup the default B2C Client ID in the Salesforce Platform');

                // -------------------------------------------------------------
                // Attempt to create the B2C Client ID record
                // -------------------------------------------------------------

                // Validate that the B2C Client ID exists
                output.b2cClientIDVerifyResults = await cliAPI.sfB2CClientIDGet(
                    output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                    environmentDef);

                // Did an error occur with the validation?
                if (output.b2cClientIDVerifyResults.status === false) {
                    throw new Error('Unable to verify the B2C Client ID; please try again');
                }

                // Was a B2C ClientID verified? If not, then create the default record
                if (output.b2cClientIDVerifyResults.success === true && output.b2cClientIDVerifyResults.totalSize === 0) {

                    // Attempt to create the B2C ClientID definition
                    output.b2cClientIDCreateResults = await cliAPI.sfB2CClientIDCreate(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                        environmentDef
                    );

                    // Audit the B2C ClientID value that was created
                    b2cClientId = output.b2cClientIDCreateResults.id;

                    // Audit that the record was created and capture the B2C ClientID
                    console.log(` -- Verified the default B2C ClientID exists [${b2cClientId}]`);

                    // Otherwise, verify that the record was created
                } else if (output.b2cClientIDVerifyResults.success === true && output.b2cClientIDVerifyResults.totalSize === 1) {

                    // Audit the B2C ClientID value that was retrieved
                    b2cClientId = output.b2cClientIDVerifyResults.records[0].Id;

                    // Audit that the record was created and capture the B2C ClientID
                    console.log(` -- Verified the default B2C ClientID exists [${b2cClientId}]`);

                    // Attempt to create the B2C ClientID definition
                    output.b2cClientIDUpdateResults = await cliAPI.sfB2CClientIDUpdate(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                        environmentDef,
                        b2cClientId
                    );

                    // Did an error occur with the update?
                    if (output.b2cClientIDUpdateResults.status === false) {
                        throw new Error('Unable to update / reset the B2C Client ID; please try again');
                    }

                    // Audit that the B2C Client ID was updated / reset to its default values
                    console.log(` -- Reset the B2C Client ID to its default values [${b2cClientId}]`);


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
