/* eslint-disable no-underscore-dangle */
'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');

// Retrieve the helper function that calculates the default program option value
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function OOBOCustomersVerify
 * @description This function is used to retrieve the anonymous B2C Commerce Customer that is used
 * specifically for OOBO (Order on Behalf Of / Assisted Shopping)
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:oobo:customers:verify')
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
        .description('Retrieve the OOBO user details for each configured storefront -- defaults to the ' +
            'storefronts defined in the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize local variables
            let customerVerifyResults,
                sitePreferenceResults,
                resultObj;

            // Initialize the command options
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
                    'Attempting to retrieve the OOBO Customer Profiles for each storefront',
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
                    console.log(' -- Sites verification details - successfully verified these sites');
                    cliUi.outputResults(
                        resultObj.outputDisplay.verifySites.success,
                        undefined,
                        'cliTableConfig.siteOutput');

                    // Display the configured collection of the OOBO Customer Profile(s) in B2C Commerce
                    console.log(' -- Verifying the OOBO Anonymous Customer records for these customerLists');
                    customerVerifyResults = await cliAPI.b2cOOBOCustomersVerify(
                        environmentDef, resultObj.siteResults.success);

                    // Was at least one customerProfile verified?
                    if (customerVerifyResults.length === 0) {

                        // If not, output the default no-profiles-found error message
                        console.log(' -- No OOBO profiles found for the verified B2C Commerce parent customerLists');

                    } else {

                        // Output the validationResults for each related customerList
                        for (let thisResult of customerVerifyResults) {

                            // Output the validation and customer creation-results for each customerList
                            cliUi.outputResults(
                                thisResult.outputDisplay.customerGet,
                                undefined,
                                'cliTableConfig.customerDetails');

                            // Iterate over these customers and update the B2C Site definitions with the OOBO customers
                            await cliAPI.sfOOBOB2CSitesUpdate(environmentDef, thisResult);

                        }

                        // Take the collection of siteResults and the customerResults -- and update the customerId site preference
                        console.log(' -- Retrieving the OOBO Anonymous Customer customerId values from ' +
                            'sitePreferences for these sites');
                        sitePreferenceResults = await cliAPI.b2cOOBOSitePrefsGet(
                            environmentDef,
                            resultObj.outputDisplay.authenticate.authToken,
                            resultObj.siteResults.success);

                        // Output the sitePreference update results
                        for (let thisResult of sitePreferenceResults.outputDisplay) {

                            // Output the validation and customer creation-results for each customerList
                            cliUi.outputResults(
                                thisResult,
                                undefined,
                                'cliTableConfig.sitePreferenceDetails');

                        }

                    }

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
