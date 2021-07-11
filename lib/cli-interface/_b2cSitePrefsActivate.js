/* eslint-disable no-underscore-dangle */
'use strict';

// Initialize module dependencies
const config = require('config');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');
const dataAPIs = require('../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../lib/_common/request');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function b2cSitePrefsActivate
 * @description This function is used to activate the sitePreferences for all verified sites.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:siteprefs:activate')
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
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .description('Active all the b2c-crm-sync sitePreferences for registered storefronts; defaults ' +
            'to the storefronts defined in the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize the command options
            const commandOptions = commandObj.opts();

            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const b2cConnProperties = common.getB2CConnProperties(environmentDef);
            const b2cSitePrefGroups = config.get('sitePreferenceGroups');

            // Initialize local variables
            let resultObj,
                baseRequest,
                syncConfiguration,
                sitePrefResults;

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to register the OOBO Customer Profiles for each storefront',
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    b2cConnProperties,
                    config.get('errors.b2c.badEnvironment'));

                // Retrieve and output the results of the verification process
                resultObj = await cliAPI.verifyB2CSites(commandOptions);

                // Render the authentication details from site validation
                cliUi.outputResults(
                    [resultObj.outputDisplay.authenticate],
                    undefined,
                    'cliTableConfig.b2cAuthTokenOutput');

                // Output the validation results for the site collection (failure)
                if (resultObj.outputDisplay.verifySites.error.length > 0) {

                    // Render the site verification details for error sites
                    console.log(' -- Failed to verify the following B2C Commerce Storefronts');
                    cliUi.outputResults(
                        resultObj.outputDisplay.verifySites.error,
                        undefined,
                        'cliTableConfig.siteErrors');

                }

                // Output the validation results for the site collection (success)
                if (resultObj.outputDisplay.verifySites.success.length > 0) {

                    // Render the site verification details for success sites
                    console.log(' -- Successfully verified the following B2C Commerce Storefronts');
                    cliUi.outputResults(
                        resultObj.outputDisplay.verifySites.success,
                        undefined,
                        'cliTableConfig.siteOutput');

                    // Capture and shorthand the authToken
                    resultObj.authToken = resultObj.apiCalls.authenticate.authToken;

                    // Initialize the base request leveraged by this process
                    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

                    // Loop over the collection of sites that were verified
                    for (let thisSite of resultObj.siteResults.success) {

                        // Loop over the collection of configured sitePreferenceGroups
                        for (let thisGroup of b2cSitePrefGroups) {

                            // Audit the site and preferenceGroup being processed
                            console.log(' -- Activating sitePreferences for B2C Site ' +
                                `preferenceGroup: ${thisSite.siteId}.${thisGroup}`);

                            // Retrieve the syncConfiguration for each preferenceGroup
                            syncConfiguration = config.get(`sitePreferences.${thisGroup}`);

                            // Evaluate if the test customer already exists in the B2C Commerce environment
                            sitePrefResults = await dataAPIs.sitePreferencesPatch(
                                baseRequest,
                                resultObj.apiCalls.authenticate.authToken,
                                thisSite.siteId,
                                thisGroup,
                                syncConfiguration);

                        }

                    }

                    cliUi.outputResults();

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
