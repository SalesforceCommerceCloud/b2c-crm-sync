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
 * @function b2cVerify
 * @description This function consolidates environment, site, and code-version validation functions
 * into a single CLI command that can process .env or CLI-driven configurations
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:verify')
        .requiredOption(config.get('cliOptions.b2cHostName.cli'), config.get('cliOptions.b2cHostName.description'), getProgramOptionDefault('b2cHostName'))
        .requiredOption(config.get('cliOptions.b2cClientId.cli'), config.get('cliOptions.b2cClientId.description'), getProgramOptionDefault('b2cClientId'))
        .requiredOption(config.get('cliOptions.b2cClientSecret.cli'), config.get('cliOptions.b2cClientSecret.description'), getProgramOptionDefault('b2cClientSecret'))
        .requiredOption(config.get('cliOptions.b2cCodeVersion.cli'), config.get('cliOptions.b2cCodeVersion.description'), getProgramOptionDefault('b2cCodeVersion'))
        .requiredOption(config.get('cliOptions.b2cSiteIds.cli'), config.get('cliOptions.b2cSiteIds.description'), getProgramOptionDefault('b2cSiteIds'))
        .description('Verifies the B2C Commerce environment, configured sites, and code-version -- leverages the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            // Generate the validation results for all dependent attributes
            const b2cConnProperties = common.getB2CConnProperties(environmentDef);
            const b2cCodeProperties = common.getB2CCodeVersion(environmentDef);

            try {

                // Output the environment details
                cliUi.cliCommandBookend(commandObj._name, 'start');
                console.log(' -- Attempting to verify the B2C environment using the following environment details');
                cliUi.outputEnvironmentDef(environmentDef);

                // Were any validation errors found with the connection properties?
                if (b2cConnProperties.isValid !== true || b2cCodeProperties.isValid !== true) {
                    cliUi.outputResults(undefined, config.get('errors.b2c.badEnvironment'));
                    return commandProgram;
                }

                // Retrieve and output the results of the verification process
                const resultObj = await cliAPI.b2cVerify(commandOptions);
                // Render the authentication details
                cliUi.outputResults([resultObj.outputDisplay.authenticate], undefined, 'cliTableConfig.b2cAuthTokenOutput');

                // Were sites verified?
                if (resultObj.outputDisplay.verifySites.success.length > 0) {
                    // Render the site verification details for success sites
                    console.log(' -- Sites verification details - successfully verified these sites');
                    cliUi.outputResults(resultObj.outputDisplay.verifySites.success, undefined, 'cliTableConfig.siteOutput');
                }

                // Were site verification errors found?
                if (resultObj.outputDisplay.verifySites.error.length > 0) {
                    // Render the site verification details for error sites
                    console.log(' -- Sites verification details - failed to verify these sites');
                    cliUi.outputResults(resultObj.outputDisplay.verifySites.error, undefined, 'cliTableConfig.siteErrors');
                }

                // Render the code version verification details
                console.log(' -- Code version verification details');
                cliUi.outputResults([resultObj.outputDisplay.verifyCodeVersion], undefined, 'cliTableConfig.codeVersionOutput');

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
