'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function _b2cAuthJWT
 * @description This function is used to verify that authentication against B2C Commerce's Account Manager via JWT is possible.
 * Commands are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:auth:jwt')
        .requiredOption(config.get('cliOptions.b2cHostName.cli'), config.get('cliOptions.b2cHostName.description'), getProgramOptionDefault('b2cHostName'))
        .requiredOption(config.get('cliOptions.b2cUsername.cli'), config.get('cliOptions.b2cUsername.description'), getProgramOptionDefault('b2cUsername'))
        .requiredOption(config.get('cliOptions.b2cAccessKey.cli'), config.get('cliOptions.b2cAccessKey.description'), getProgramOptionDefault('b2cAccessKey'))
        .requiredOption(config.get('cliOptions.b2cClientId.cli'), config.get('cliOptions.b2cClientId.description'), getProgramOptionDefault('b2cClientId'))
        .requiredOption(config.get('cliOptions.sfCertDeveloperName.cli'), config.get('cliOptions.sfCertDeveloperName.description'), getProgramOptionDefault('sfCertDeveloperName'))
        .description('Attempts to authenticate against the specified B2C Commerce Account Manager environment leveraging JWT -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            // Generate the validation results for all dependent attributes
            const jwtConnProperties = common.getJWTConnProperties(environmentDef);

            try {

                // Output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to authenticate against the configured Account Manager instance using JWT');
                cliUi.outputEnvironmentDef(environmentDef);

                // Were any validation errors found with the connection properties?
                if (jwtConnProperties.isValid !== true) {
                    cliUi.outputResults(undefined, config.get('errors.b2c.badEnvironment'));
                    return commandProgram;
                }

                // Attempt to authenticate against AccountManager via JWT
                const resultObj = await cliAPI.b2cAuthJWT(environmentDef);

                // Was authentication successful?
                if (resultObj.success === true) {

                    // Output the success results via the console
                    cliUi.outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.b2cAuthTokenOutput');

                } else {

                    // Output the success results via the console
                    cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.genericFault');

                    // Throw a hard error and invoke the visual error handler
                    throw 'Unable to authenticate against the B2C Commerce Account Manager';

                }

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
