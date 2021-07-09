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
 * @function codeVersionActivate
 * @description This function is used to activate a specific code-version for the B2C Commerce
 * Environment.  Commands are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:cv:activate')
        .requiredOption(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
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
            config.get('cliOptions.b2cCodeVersion.cli'),
            config.get('cliOptions.b2cCodeVersion.description'),
            getProgramOptionDefault('b2cCodeVersion')
        )
        .description('Activates the configured code-version for the specified B2C Commerce environment' +
            ' -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            // Generate the validation results for all dependent attributes
            const b2cConnProperties = common.getB2CConnProperties(environmentDef);
            const b2cCodeProperties = common.getB2CCodeVersion(environmentDef);

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    `Attempting to activate the B2C code-version [${environmentDef.b2cCodeVersion}]`,
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    b2cConnProperties,
                    config.get('errors.b2c.badEnvironment'));

                // Were any validation errors found with the code properties?
                cliUi.validateConnectionProperties(
                    b2cCodeProperties,
                    config.get('errors.b2c.badEnvironment'));

                // Activate the code version
                const resultObj = await cliAPI.b2cCodeVersionActivate(environmentDef);

                // Render the authentication details
                cliUi.outputResults(
                    [resultObj.outputDisplay.authenticate],
                    undefined,
                    'cliTableConfig.b2cAuthTokenOutput');

                // Render the code version details
                cliUi.outputResults(
                    [resultObj.outputDisplay.codeVersionGet],
                    undefined,
                    'cliTableConfig.codeVersionOutput');

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
