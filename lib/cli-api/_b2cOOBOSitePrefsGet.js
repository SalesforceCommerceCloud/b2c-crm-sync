'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../lib/_common/request');

/**
 * @function _b2cOOBOSitePrefsGet
 * @description Attempts to update the sitePreference used to manage the OOBO CustomerID (to validate logins)
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use
 * @param {String} b2cAdminAuthToken Represents the B2C Commerce authToken used to perform REST API calls
 * @param {Array} verifiedSites Represents the collection of verified sites to process (to get customerLists)
 * @returns {Promise} Returns the results of the sitePreferences update activity
 */
module.exports = (environmentDef, b2cAdminAuthToken, verifiedSites) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        thisCustomerList,
        baseRequest,
        preferenceGroup,
        preferenceGetResults;

    // Initialize the output property
    output = {
        siteResults: [],
        outputDisplay: []
    };

    // Initialize the base request leveraged by this process
    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

    // Retrieve the current preference group
    preferenceGroup = config.get('unitTests.testData.crmSyncOOBOSitePreferenceGroup');

    try {

        // Loop over the collection of verified sites
        for (let thisSite of verifiedSites) {

            // Create a reference to the current customerList and customerProfile
            thisCustomerList = thisSite.data.customerList;

            // Force the update to the preferenceGroup and set the customerId for the related storefront
            preferenceGetResults = await dataAPIs.sitePreferencesGet(
                baseRequest, b2cAdminAuthToken, thisSite.siteId, preferenceGroup
            );

            // Capture the output details
            output.siteResults.push(preferenceGetResults);

            // Was the siteResults update successful?
            if (preferenceGetResults.success === true) {

                // Build the output display
                output.outputDisplay.push([
                    ['customerListId', thisCustomerList],
                    ['siteId', thisSite.siteId],
                    ['AgentHeaderIsEnabled', (preferenceGetResults.data.hasOwnProperty('c_b2ccrm_syncAgentHeaderIsEnabled') ? preferenceGetResults.data.c_b2ccrm_syncAgentHeaderIsEnabled : '---')],
                    ['OOBOGuestCustomerId', (preferenceGetResults.data.hasOwnProperty('c_b2ccrm_syncOOBOGuestCustomerId') ? preferenceGetResults.data.c_b2ccrm_syncOOBOGuestCustomerId : '---')]
                ]);

            } else {

                // Build the error display
                output.outputDisplay.push([
                    ['customerListId', thisCustomerList],
                    ['siteId', thisSite.siteId],
                    ['errorType', preferenceGetResults.data.fault.type],
                    ['errorMessage', preferenceGetResults.data.fault.messsage]
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
