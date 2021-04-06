'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');

/**
 * @function disableCRMSync
 * @description Helper function to disable b2c-crm-sync via OCAPI
 *
 * @param {Object} environmentDef Represents the configuration for the current environment
 * @param {String} b2cAdminAuthToken Represents the base API request to leverage for B2C Commerce
 * @param {String} siteId Represents the current site being targeted with related automation
 * @return {Promise} Returns an object summary containing processing results
 */
module.exports = async (environmentDef, b2cAdminAuthToken, siteId) => {

    // Initialize local variables
    let baseRequest,
        preferenceGroup,
        preferenceUpdate;

    // Initialize the base request leveraged by this process
    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

    // Retrieve the current preference group
    preferenceGroup = config.get('unitTests.testData.crmSyncSitePreferenceGroup');

    // Build the update to re-enable OCAPI
    preferenceUpdate = {
        "c_b2ccrm_syncCustomersEnabled": true,
        "c_b2ccrm_syncCustomersOnLoginEnabled": true,
        "c_b2ccrm_syncCustomersOnLoginOnceEnabled": true,
        "c_b2ccrm_syncIsEnabled": false,
        "c_b2ccrm_syncCustomersViaOCAPI": false
    }

    // Evaluate if the test customer already exists in the B2C Commerce environment
    return await dataAPIs.sitePreferencesPatch(
        baseRequest, b2cAdminAuthToken, siteId, preferenceGroup, preferenceUpdate);

};
