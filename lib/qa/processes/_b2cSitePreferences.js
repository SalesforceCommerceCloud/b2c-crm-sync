'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const ciAPIs = require('../../../lib/apis/ci');
const requestLib = require('../../../lib/_common/request');

/**
 * @function b2cSitePreferences
 * @description This function is used retrieve and manage site-preferences via B2C Commerce REST APIs.
 *
 * @param {Object} envDef Represents the current environment definition used to process testing
 * @param {String} siteId Represents the current siteId being used for testing
 * @returns {Promise} Returns the promise containing the request processing results
 */
module.exports = async (envDef, siteId) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        baseRequest,
        adminAuthToken,
        preferenceGroup,
        preferenceUpdate;

    // Audit the default attributes
    output = {
        baseStatus: {
            success: false,
            environmentDef: envDef,
            siteId: siteId
        }
    };

    try {

        // Retrieve the current preference group
        preferenceGroup = config.get('unitTests.testData.crmSyncSitePreferenceGroup');

        // Initialize the base request leveraged by this process
        baseRequest = requestLib.createRequestInstance(envDef);

        // -----------------------------------------------------------------
        // BEGIN: B2C Commerce Site Preference Gymnastics
        // -----------------------------------------------------------------

        // Shorthand the B2C administrative authToken
        adminAuthToken = await ciAPIs.authenticate(envDef);

        // Evaluate if the test customer already exists in the B2C Commerce environment
        output.getSitePreferences = await dataAPIs.sitePreferencesGet(
            baseRequest, adminAuthToken, siteId, preferenceGroup);

        // Build the update to disable OCAPI
        preferenceUpdate = {
            c_b2ccrm_syncCustomersViaOCAPI: false
        };

        // Evaluate if the test customer already exists in the B2C Commerce environment
        output.getPatchPreferences = await dataAPIs.sitePreferencesPatch(
            baseRequest, adminAuthToken, siteId, preferenceGroup, preferenceUpdate);

        // Build the update to re-enable OCAPI
        preferenceUpdate = {
            c_b2ccrm_syncCustomersEnabled: true,
            c_b2ccrm_syncCustomersOnLoginEnabled: true,
            c_b2ccrm_syncCustomersOnLoginOnceEnabled: true,
            c_b2ccrm_syncIsEnabled: true,
            c_b2ccrm_syncCustomersViaOCAPI: true
        };

        // Evaluate if the test customer already exists in the B2C Commerce environment
        output.resetSitePreferences = await dataAPIs.sitePreferencesPatch(
            baseRequest, adminAuthToken, siteId, preferenceGroup, preferenceUpdate);

        // -----------------------------------------------------------------
        //   END: B2C Commerce Site Preference Gymnastics
        // -----------------------------------------------------------------

        // Audit the default attributes
        output.baseStatus.success = true;

        // Resolve the promise
        resolve(output);

    } catch (e) {

        // Capture the error
        output.error = e;

        // Reject the promise
        reject(output);

    }

});

