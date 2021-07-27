'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../lib/_common/request');

/**
 * @function _b2cOOBOSitePrefsUpdate
 * @description Attempts to update the sitePreference used to manage the OOBO CustomerID (to validate logins)
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} b2cAdminAuthToken Represents the B2C Commerce authToken used to perform REST API calls
 * @param {Array} verifiedSites Represents the collection of verified sites to process (from which customerLists will be retrieved)
 * @param {Array} [customerProfiles] Represents the collection of verified OOBO Customer Profiles for the verified sites
 * @returns {Promise} Returns the results of the sitePreference update
 */
module.exports = (environmentDef, b2cAdminAuthToken, verifiedSites, customerProfiles) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        let output,
            profileMap,
            thisCustomerList,
            siteProfile,
            baseRequest,
            preferenceGroup,
            preferenceUpdateResults;

        // Initialize the output property
        output = {
            siteResults: [],
            outputDisplay: []
        };

        // Only build the profileMap if customerProfiles are provided
        if (customerProfiles !== undefined) {

            // Initialize the profileMap
            profileMap = {};

            // Create the profileMap representing OOBO Customer Profiles
            for (let thisProfile of customerProfiles) {
                profileMap[thisProfile.profile.customerListId] = thisProfile.profile;
            }

        }

        // Initialize the base request leveraged by this process
        baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

        // Retrieve the current preference group
        preferenceGroup = config.get('unitTests.testData.crmSyncOOBOSitePreferenceGroup');

        try {

            // Loop over the collection of verified sites
            for (let thisSite of verifiedSites) {

                // Create a reference to the current customerList and customerProfile
                thisCustomerList = thisSite.data.customerList;

                // Default the siteProfile for the current site
                if (customerProfiles !== undefined) {
                    siteProfile = profileMap[thisCustomerList];
                } else {
                    siteProfile = {customerId: null};
                }

                // Force the update to the preferenceGroup and set the customerId for the related storefront
                preferenceUpdateResults = await dataAPIs.sitePreferencesPatch(
                    baseRequest,
                    b2cAdminAuthToken,
                    thisSite.siteId,
                    preferenceGroup,
                    {
                        c_b2ccrm_syncOOBOGuestCustomerId: siteProfile.customerId
                    }
                );

                // Capture the output details
                output.siteResults.push(preferenceUpdateResults);

                // Was the siteResults update successful?
                if (preferenceUpdateResults.success === true) {

                    // Build the output display
                    output.outputDisplay.push([
                        ['customerListId', thisCustomerList],
                        ['siteId', thisSite.siteId],
                        ['success', true],
                        ['OOBOGuestCustomerId', ((siteProfile.customerId === null) ? '---' : siteProfile.customerId)]
                    ]);

                } else {

                    // Build the error display
                    output.outputDisplay.push([
                        ['customerListId', thisCustomerList],
                        ['siteId', thisSite.siteId],
                        ['success', false],
                        ['errorType', preferenceUpdateResults.data.fault.type],
                        ['errorMessage', preferenceUpdateResults.data.fault.messsage]
                    ]);

                }

            }

            // Return the processed results
            resolve(output);

        } catch (e) {

            // Reject and return the error
            reject(e);

        }

    });
