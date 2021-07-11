/* eslint-disable no-underscore-dangle,max-len */
// noinspection ExceptionCaughtLocallyJS

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
 * @function displayOOBOPassword
 * @description This function generates the OOBO per-user credential password. It displays
 * it visually to make configuring the password easier for end-users.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:oobo:password:display')
        .requiredOption(
            config.get('cliOptions.b2cClientSecret.cli'),
            config.get('cliOptions.b2cClientSecret.description'),
            getProgramOptionDefault('b2cClientSecret')
        )
        .option(
            config.get('cliOptions.b2cAccessKey.cli'),
            config.get('cliOptions.b2cAccessKey.description'),
            getProgramOptionDefault('b2cAccessKey')
        )
        .requiredOption(
            config.get('cliOptions.sfHostName.cli'),
            config.get('cliOptions.sfHostName.description'),
            getProgramOptionDefault('sfHostName')
        )
        .description('Attempts to display the OOBO password leveraged by the per-user namedCredential ' +
            ' for the "Order on Behalf Of" use-case (defaults to .env; overridden by the CLI')
        .action(commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();

            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);

            try {

                // Generate the opening CLI command bookend for this command
                cliUi.cliCommandBookend(commandObj._name, 'start');

                // Ensure that the accessKey is well-formed before generating the password display
                if (environmentDef.b2cAccessKey === undefined || environmentDef.b2cAccessKey.length === 0) {

                    throw new Error('Unable to generate perUser NamedCredential Password; check your b2cAccessKey.');

                // Ensure that the clientSecret is well-formed before generating the password display
                } else if (environmentDef.b2cClientSecret === undefined || environmentDef.b2cClientSecret.length === 0) {

                    throw new Error('Unable to generate perUser NamedCredential Password; check your b2cClientSecret.');

                } else {

                    // Otherwise, generate the password display
                    console.log(' -- Generating the OOBO perUser Named Credential Password for your user');
                    console.log(' -- The password is comprised of the WebAccessKey : ClientSecret');
                    console.log(' -- Please copy the password displayed below to your clipboard');
                    console.log('');
                    console.log(`    ${environmentDef.b2cAccessKey}:${environmentDef.b2cClientSecret}`);
                    console.log('');
                    console.log(' -- Use this password when creating the perUser Named Credential required');
                    console.log(' -- by the "Order on Behalf Of" use-case to authenticate Agents via B2C Commerce');
                    console.log('');
                    console.log(' -- Configure your perUser Named Credential via this Url to your Salesforce Org');
                    console.log(` -- https://${environmentDef.sfHostName}/lightning/settings/personal/ExternalObjectUserSettings/home`);

                }

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                // Close the CLI command bookend for this command
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
