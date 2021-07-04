'use strict';

// Initialize module dependencies
const config = require('config'),

    // Initialize the CLI api
    cliAPI = require('../../index'),

    // Initialize local libraries
    cliUi = require('../../lib/cli-interface/ui'),
    common = require('../../lib/cli-api/_common'),
    getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function b2cAuthBMUser
 * @description This function is used to verify that authentication against B2C Commerce using
 * the Business Manager credentials in the environment configuration is possible.  Commands are
 * abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @returns {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:auth:bmuser')
        .requiredOption(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
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
        .description('Attempts to authenticate against the specified B2C Commerce environment using BM User Credentials')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts(),
                // Retrieve the runtime environment
                environmentDef = cliAPI.getRuntimeEnvironment(commandOptions),
                // Generate the validation results for all dependent attributes
                b2cConnProperties = common.getB2CConnProperties(environmentDef);

            try {

                // Output the environment details
                // eslint-disable-next-line no-underscore-dangle
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to authenticate against the B2C instance via Business Manager credentials');
                cliUi.outputEnvironmentDef(environmentDef);

                // Were any validation errors found with the connection properties?
                if (b2cConnProperties.isValid !== true) {
                    cliUi.outputResults(undefined, config.get('errors.b2c.badEnvironment'));
                    return commandProgram;
                }

                // Attempt to authenticate using BM User credentials
                const resultObj = await cliAPI.b2cAuthBMUser(environmentDef);
                cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.b2cAuthTokenOutput');

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
