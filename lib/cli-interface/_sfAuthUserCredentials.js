/* eslint-disable no-underscore-dangle */
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
* @function _dxAuthUserCredentials
* @description This function is used to verify that authentication against a given Salesforce DX environment
* using the environment configuration is possible.  Commands are abstracted in this manner to facilitate
 * unit testing of each command separately.
*
* @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
* @return {Object} Returns the updated commandProgram -- including the command that was just attached
*/
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:auth:usercreds')
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
        .description('Attempts to authenticate against the specified SFDC environment leveraging user-credentials' +
            ' -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            // Generate the validation results for all dependent attributes
            const sfConnProperties = common.getSFUserCredConnProperties(environmentDef);

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to authenticate against the configured Salesforce Platform instance',
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    sfConnProperties,
                    config.get('errors.sf.badEnvironment'));

                // Are the SF authCredentials valid and usable?
                await cliUi.validateSFAuth(environmentDef);

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
