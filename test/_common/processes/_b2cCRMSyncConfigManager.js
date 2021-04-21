'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');

/**
 * @function b2cCRMSyneConfigManager
 * @description Helper function to enable, disable, and manage the configuration of b2c-crm-sync via OCAPI
 *
 * @param {Object} environmentDef Represents the configuration for the current environment
 * @param {String} b2cAdminAuthToken Represents the base API request to leverage for B2C Commerce
 * @param {String} siteId Represents the current site being targeted with related automation
 * @param {Object} [syncConfiguration] Represents the current b2c-crm-sync site-preference configuration to exercise
 * @return {Object} Returns an object summary containing processing results
 */
module.exports = async (environmentDef, b2cAdminAuthToken, siteId, syncConfiguration) => {

    // Initialize local variables
    let baseRequest,
        preferenceGroup;

    // If no sync-configuration is defined, go ahead and grab the base configuration (defaults to activation)
    if (syncConfiguration === undefined) { syncConfiguration = config.util.toObject(config.get('unitTests.b2cCRMSyncConfigManager.base')); }

    // Initialize the base request leveraged by this process
    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

    // Retrieve the current preference group
    preferenceGroup = config.get('unitTests.testData.crmSyncSitePreferenceGroup');

    // Evaluate if the test customer already exists in the B2C Commerce environment
    return await dataAPIs.sitePreferencesPatch(
        baseRequest, b2cAdminAuthToken, siteId, preferenceGroup, syncConfiguration);

};
