'use strict';

/**
 * @module hooks/customer.process
 */

/**
 * @type {dw/system/Logger}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'hooks.customer.process');

/**
 * This returns true if the integration with the Salesforce Platform is enabled or false otherwise
 *
 * @return {Boolean}
 */
function isIntegrationEnabled() {
    var Site = require('dw/system/Site').getCurrent();
    var isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncIsEnabled');
    var isSyncCustomersEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersEnabled');
    return isSyncEnabled && isSyncCustomersEnabled;
}

/**
 * Customer logged-in
 * Ensure the customer sync and logged-in sync are enabled, and the customer has never been synchronized to the Salesforce Core platform
 * And if so, process the customer sync with the Salesforce Core platform
 *
 * @param {dw/customer/Profile} profile
 */
function customerLoggedIn(profile) {
    if (!isIntegrationEnabled() || !profile) {
        return;
    }

    // Ensure the login sync is also enabled
    // And the profile has never been exported yet
    var Site = require('dw/system/Site').getCurrent();
    var isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersOnLoginEnabled');
    var isSyncOnceEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersOnLoginOnceEnabled');
    if (!isSyncEnabled || (isSyncOnceEnabled && profile.custom.b2ccrm_contactId !== undefined)) {
        return;
    }

    handleProcess(profile, 'login');
}

/**
 * Customer created
 * Ensure the customer sync is enabled, and if so, process the customer sync with the Salesforce platform
 *
 * @param {dw/customer/Profile} profile
 */
function customerCreated(profile) {
    if (!isIntegrationEnabled() || !profile) {
        return;
    }

    handleProcess(profile, 'create');
}

/**
 * Customer updated
 * Ensure the customer sync is enabled, and if so, process the customer sync with the Salesforce platform
 *
 * @param {dw/customer/Profile} profile
 */
function customerUpdated(profile) {
    if (!isIntegrationEnabled() || !profile) {
        return;
    }

    handleProcess(profile, 'update');
}

/**
 * This method will send the given {profile} details to Salesforce Core through REST API
 *
 * @param {dw/customer/Profile} profile
 * @param {String} action The action that triggered the process (create/update/login)
 */
function handleProcess(profile, action) {
    var ServiceMgr = require('../services/ServiceMgr');
    var profileModel = new (require('../models/customer'))(profile, 'process');

    try {
        // Set the profile status, meaning that we start the export process
        profileModel.updateStatus('not_exported');
        var requestBody = profileModel.getProcessRequestBody();
        LOGGER.info('Exporting the customer profile to Salesforce core. Here is the request body: {0}', requestBody);
        var result = ServiceMgr.callRestService('customer', 'process', requestBody);

        // Error while calling the service
        // The service did not returned a 20x response
        if (result.status !== 'OK') {
            profileModel.updateStatus('failed');
            profileModel.updateSyncResponseText(require('dw/util/StringUtils').format('Status {0} ({1}): {2}', result.error, result.msg, result.errorMessage));
            LOGGER.error('Error occurred while exporting customer profile: {0}({1}): {2}', result.status, result.msg, result.errorMessage);
            return;
        }

        // The flow always return multiple values, but we only get the first one
        var resultObject = result.object[0];

        // The service returned a 20x response, but with an error in the response body
        if (resultObject.isSuccess === false) {
            var errorsAsString = JSON.stringify(resultObject.errors);
            profileModel.updateStatus('failed');
            profileModel.updateSyncResponseText(errorsAsString);
            LOGGER.error('Error occurred while exporting customer profile: {0}', errorsAsString);
            return;
        }

        // The export succeed
        LOGGER.info('Successfully exported the customer profile. Here is the response body: {0}', JSON.stringify(resultObject));
        profileModel.updateExternalId(resultObject.outputValues.Contact.AccountId, resultObject.outputValues.Contact.Id);
        profileModel.updateStatus('exported');
        profileModel.updateSyncResponseText(require('dw/util/StringUtils').format('Successfully exported to Salesforce Core platform during the "{0}" logic.', action));
    } catch (e) {
        profileModel.updateStatus('failed');
        profileModel.updateSyncResponseText(e.message);
        LOGGER.error('Error occurred while exporting customer profile: {0}', e.message);
    }
}

module.exports.loggedIn = customerLoggedIn;
module.exports.created = customerCreated;
module.exports.updated = customerUpdated;
