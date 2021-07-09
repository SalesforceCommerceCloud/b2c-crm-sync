/* eslint-disable no-underscore-dangle */
'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize the CLI UI collection of functions
const cliUi = require('../../lib/cli-interface/ui');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function getB2CEnvironment
 * @description This function is used to expose the runtimeEnvironment details to a CLI user.  Commands
 * are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:env:list')
        .option(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
        )
        .option(
            config.get('cliOptions.b2cClientId.cli'),
            config.get('cliOptions.b2cClientId.description'),
            getProgramOptionDefault('b2cClientId')
        )
        .option(
            config.get('cliOptions.b2cClientSecret.cli'),
            config.get('cliOptions.b2cClientSecret.description'),
            getProgramOptionDefault('b2cClientSecret')
        )
        .option(
            config.get('cliOptions.b2cInstanceName.cli'),
            config.get('cliOptions.b2cInstanceName.description'),
            getProgramOptionDefault('b2cInstanceName')
        )
        .option(
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .option(
            config.get('cliOptions.b2cDataRelease.cli'),
            config.get('cliOptions.b2cDataRelease.description'),
            getProgramOptionDefault('b2cDataRelease')
        )
        .option(
            config.get('cliOptions.b2cCodeVersion.cli'),
            config.get('cliOptions.b2cCodeVersion.description'),
            getProgramOptionDefault('b2cCodeVersion')
        )
        .option(
            config.get('cliOptions.b2cUsername.cli'),
            config.get('cliOptions.b2cUsername.description'),
            getProgramOptionDefault('b2cUsername')
        )
        .option(
            config.get('cliOptions.b2cAccessKey.cli'),
            config.get('cliOptions.b2cAccessKey.description'),
            getProgramOptionDefault('b2cAccessKey')
        )
        .description('Attempts to read the current b2c-environment definition either through the ' +
            'CLI, the .env configuration file, or a combination (overriding the .env via the CLI)')
        .action(commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            // Generate the opening CLI command bookend for this command
            cliUi.cliCommandBookend(commandObj._name, 'start');
            // Output the environment definition visually
            cliUi.outputEnvironmentDef(environmentDef);
            // Close the CLI command bookend for this command
            cliUi.cliCommandBookend(commandObj._name, 'end');

        });

    // Return the program with the appended command
    return commandProgram;
};
