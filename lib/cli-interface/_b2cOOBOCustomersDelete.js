/* eslint-disable no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

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
 * @function OOBOCustomersDelete
 * @description This function is used to delete the anonymous B2C Commerce Customer that is used
 * specifically for OOBO (Order on Behalf Of / Assisted Shopping)
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:oobo:customers:delete')
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
        .description('Remove the OOBO user created for each configured storefront -- defaults to the ' +
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
                    console.log('-- Failed to verify the following B2C Commerce Storefronts');
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
                    console.log(' -- Removing the OOBO Anonymous Customer records for these customerLists');
                    customerVerifyResults = await cliAPI.b2cOOBOCustomersVerify(
                        environmentDef, resultObj.siteResults.success);

                    // Was at least one customerProfile verified?
                    if (customerVerifyResults.length === 0) {

                        // If not, output the default no-profiles-found error message
                        console.log(' -- No OOBO profiles found for the verified B2C Commerce parent customerLists');

                    } else {

                        // Output the validationResults for each related customerList
                        for (let thisResult of customerVerifyResults) {

                            // Attempt to delete the OOBO customerProfiles associated to these sites
                            await cliAPI.b2cOOBOCustomerDelete(
                                environmentDef, thisResult.profile);

                            // Output the validation and customer creation-results for each customerList
                            cliUi.outputResults(
                                thisResult.outputDisplay.customerGet,
                                undefined,
                                'cliTableConfig.customerDetails');

                            // Rest the B2C Site OOBO properties for this customerList
                            await cliAPI.sfOOBOB2CSitesReset(
                                environmentDef,
                                thisResult.profile.customer_list);

                        }

                        // Take the collection of siteResults and the customerResults -- and update the customerId site preference
                        console.log(' -- Removing the OOBO Anonymous Customer customerId values from ' +
                            'sitePreferences for these sites');
                        sitePreferenceResults = await cliAPI.b2cOOBOSitePrefsUpdate(
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
