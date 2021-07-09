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
 * @function codeVersionToggle
 * @description This function is used to toggle the active code-version for the B2C Commerce
 * Environment.  Commands are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:cv:toggle')
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
        .description('Toggles the active code-version for the specified B2C Commerce environment -- defaults' +
            ' to the .env; can be overridden via the CLI\')')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            // Generate the validation results for all dependent attributes
            const b2cConnProperties = common.getB2CConnProperties(environmentDef);

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    `Attempting to toggle the B2C code-version [${environmentDef.b2cCodeVersion}]`,
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    b2cConnProperties,
                    config.get('errors.b2c.badEnvironment'));

                // Toggle the active B2C Commerce code-version
                const resultObj = await cliAPI.b2cCodeVersionToggle(environmentDef);

                // Render the authentication details
                cliUi.outputResults(
                    [resultObj.outputDisplay.authenticate],
                    undefined,
                    'cliTableConfig.b2cAuthTokenOutput');

                // Render the code versions state before the toggle
                console.log(' -- Code versions state before the toggle operation');
                cliUi.outputResults(
                    resultObj.outputDisplay.codeVersions,
                    undefined,
                    'cliTableConfig.codeVersionOutput');

                // Was a toggle code-version found?
                if (resultObj.noToggle === true) {

                    // Describe the error and call-out that one one code-version was found; we need at least two to toggle
                    console.log(' -- Unable to toggle code-versions as only one code-version was found');
                    console.log(' -- Please create another code-version to support the automated toggle CLI feature');

                } else {

                    // Render the code version details of the activation of another code version
                    console.log(' -- Newly activated code version details');
                    cliUi.outputResults(
                        [resultObj.outputDisplay.toggleCodeVersion],
                        undefined,
                        'cliTableConfig.codeVersionOutput');

                    // Render the code versions state during the toggle
                    console.log(' -- Code versions state at stage #1 of the toggle operation (activated another code version)');
                    cliUi.outputResults(
                        resultObj.outputDisplay.codeVersionsToggle,
                        undefined,
                        'cliTableConfig.codeVersionOutput');

                    // Render the code version details of the activation of the initial code version
                    console.log(' -- Re-activated code version details');
                    cliUi.outputResults(
                        [resultObj.outputDisplay.activeCodeVersion],
                        undefined,
                        'cliTableConfig.codeVersionOutput');

                    // Render the code versions state after the toggle
                    console.log(' -- Code versions state after the toggle operation (activated back the initial code version)');
                    cliUi.outputResults(
                        resultObj.outputDisplay.codeVersionsActivate,
                        undefined,
                        'cliTableConfig.codeVersionOutput');

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
