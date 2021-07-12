/* eslint-disable no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

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
        .requiredOption(
            config.get('cliOptions.sfCertDeveloperName.cli'),
            config.get('cliOptions.sfCertDeveloperName.description'),
            getProgramOptionDefault('sfCertDeveloperName')
        )
        .description('Attempts to create the default B2C Client ID that will be used to ' +
            ' drive authentication with the B2C Commerce Account Manager -- defaults to ' +
            'the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize the command options
            const commandOptions = commandObj.opts();
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const sfConnProperties = common.getSFUserCredConnProperties(environmentDef);
            const output = {};

            // Initialize local variables
            let b2cClientId,
                b2cClientIDLink;

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to create or default the B2C Client ID record in the Salesforce Platform',
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    sfConnProperties,
                    config.get('errors.sf.badEnvironment'));

                // Are the SF authCredentials valid and usable?
                output.sfAuthResults = await cliUi.validateSFAuth(environmentDef);

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

                    // Audit that we were not able to verify the B2C Client ID and are now creating it
                    console.log(' -- Verified that the default B2C Client ID does not exist; creating the default record');

                    // Attempt to create the B2C ClientID definition
                    output.b2cClientIDCreateResults = await cliAPI.sfB2CClientIDCreate(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                        environmentDef
                    );

                    // Audit the B2C ClientID value that was created
                    b2cClientId = output.b2cClientIDCreateResults.id;

                    // Audit that the record was created and capture the B2C ClientID
                    console.log(` -- Successfully created the default B2C ClientID record [${environmentDef.b2cClientId}]`);

                // Otherwise, verify that the record was created -- and update the record to reset it as a default
                } else if (output.b2cClientIDVerifyResults.success === true && output.b2cClientIDVerifyResults.totalSize === 1) {

                    // Audit the B2C ClientID value that was retrieved
                    b2cClientId = output.b2cClientIDVerifyResults.records[0].Id;

                    // Audit that the record was created and capture the B2C ClientID
                    console.log(` -- Verified the default B2C ClientID exists [${b2cClientId}]; resetting default values`);

                    // Attempt to update / reset the B2C ClientID definition
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
                    console.log(` -- Successfully reset the B2C Client ID to its default values [${b2cClientId}]`);

                }

                // Audit that the B2C Client ID was updated / reset to its default values
                b2cClientIDLink = `https://${environmentDef.sfHostName}/lightning/r/B2C_Client_ID__c/${b2cClientId}/view`;
                console.log(' -- View the Salesforce Record for this B2C ClientID via the following link');
                console.log(` -- ${b2cClientIDLink}`);

                // Output the success message
                cliUi.outputResults();

            } catch (e) {

                // Output any errors that are caught
                cliUi.outputResults(undefined, e);

            } finally {

                // Close the bookend comment
                // eslint-disable-next-line no-underscore-dangle
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
