'use strict';

/**
 * @module hooks/customer.process
 */

/**
 * @type {dw/system/Log}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'hooks.customer.process');

/**
 * @description Ensure the customer sync and logged-in sync are enabled, and the customer has never
 * been synchronized to the Salesforce Platform and if so, process the customer sync with the
 * Salesforce Platform (for customers that are logged-in)
 *
 * @param {dw/customer/Profile} profile Represents the customer profile being evaluated
 * @return {Boolean} If the process has been a success or not
 */
function customerLoggedIn(profile) {
    if (!require('*/cartridge/scripts/b2ccrmsync/util/helpers').isIntegrationEnabled() || !profile) {
        return false;
    }

    // Ensure the login sync is also enabled
    // And the profile has never been exported yet
    var Site = require('dw/system/Site').getCurrent();
    var isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersOnLoginEnabled');
    var isSyncOnceEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersOnLoginOnceEnabled');
    if (!isSyncEnabled || (isSyncEnabled && isSyncOnceEnabled && require('*/cartridge/scripts/b2ccrmsync/util/helpers').sfdcContactIDIdentifierPresent(profile))) {
        return false;
    }

    // Otherwise, go ahead and handle the login-process
    return handleProcess(profile, 'login');
}

/**
 * @description Ensure the customer sync is enabled, and if so, process the customer sync
 * with the Salesforce platform (for customers that have been created)
 *
 * @param {dw/customer/Profile} profile Represents the customer profile being evaluated
 * @return {Boolean} If the process has been a success or not
 */
function customerCreated(profile) {
    if (!require('*/cartridge/scripts/b2ccrmsync/util/helpers').isIntegrationEnabled() || !profile) {
        return false;
    }

    return handleProcess(profile, 'synchronize');
}

/**
 * Customer synchronized (by the job)
 * Ensure the customer sync is enabled, and if so, process the customer sync with the Salesforce platform
 *
 * @param {dw/customer/Profile} profile
 *
 * @return {Boolean} If the process has been a success or not
 */
function customerSynchronized(profile) {
    if (!require('*/cartridge/scripts/b2ccrmsync/util/helpers').isIntegrationEnabled() || !profile) {
        return false;
    }

    return handleProcess(profile, 'synchronize');
}

/**
 * @description Ensure the customer sync is enabled, and if so, process the customer sync
 * with the Salesforce platform (updating customers that already exist in B2C Commerce)
 *
 * @param {dw/customer/Profile} profile Represents the customer profile being evaluated
 * @return {Boolean} If the process has been a success or not
 */
function customerUpdated(profile) {
    if (!require('*/cartridge/scripts/b2ccrmsync/util/helpers').isIntegrationEnabled() || !profile) {
        return false;
    }

    return handleProcess(profile, 'update');
}

/**
 * This method will send the given {profile} details to Salesforce Core through REST API
 *
 * @param {dw/customer/Profile} profile Represents the customer profile being evaluated
 * @param {String} action The action that triggered the process (create/update/login)
 * @returns {Boolean} If the process has been a success or not
 */
function handleProcess(profile, action) {

    /**
     * @typedef resultObject Represents the resultObject returned by the B2CContactProcess service
     * @type {Object}
     * @property {Boolean} isSuccess Describes if resolution was successful or not
     * @property {Array} errors Includes any errors returned by the service
     * @property {Object} outputValues Represents the collection of returnValues provided by the service
     * @property {Object} outputValues.Contact Describes the Salesforce Contact resolved for the B2C Customer Profile
     * @property {String} outputValues.Contact.Id Represents the primary key of the resolved Salesforce Contact
     * @property {String} outputValues.Contact.AccountId Represents the primary key of the parent Salesforce Account
     */

    var ServiceMgr = require('*/cartridge/scripts/b2ccrmsync/services/ServiceMgr');
    var profileModel = new (require('*/cartridge/scripts/b2ccrmsync/models/customer'))(profile);

    try {
        // Set the profile status, meaning that we start the export process
        profileModel.updateStatus('not_exported');
        var requestBody = profileModel.getRequestBody();
        LOGGER.info('Exporting the customer profile to Salesforce core. Here is the request body: {0}', requestBody);
        var result = ServiceMgr.callRestService('customer', 'process', requestBody);

        // Error while calling the service
        // The service did not returned a 20x response
        if (result.status !== 'OK') {
            profileModel.updateStatus('failed');
            profileModel.updateSyncResponseText(require('dw/util/StringUtils').format('Status {0} ({1}): {2}', result.error, result.msg, result.errorMessage));
            LOGGER.error('Error occurred while exporting customer profile: {0}({1}): {2}', result.status, result.msg, result.errorMessage);
            return false;
        }

        // The flow always return multiple values, but we only get the first one
        var resultObject = result.object[0];

        // The service returned a 20x response, but with an error in the response body
        if (resultObject.isSuccess === false) {
            var errorsAsString = JSON.stringify(resultObject.errors);
            profileModel.updateStatus('failed');
            profileModel.updateSyncResponseText(errorsAsString);
            LOGGER.error('Error occurred while exporting customer profile: {0}', errorsAsString);
            return false;
        }

        // The export succeed
        LOGGER.info('Successfully exported the customer profile. Here is the response body: {0}', JSON.stringify(resultObject));
        profileModel.updateExternalId(resultObject.outputValues.Contact.AccountId, resultObject.outputValues.Contact.Id);
        profileModel.updateStatus('exported');
        profileModel.updateSyncResponseText(require('dw/util/StringUtils').format('Successfully exported to Salesforce Org during the "{0}" logic.', action));
        return true;
    } catch (e) {
        profileModel.updateStatus('failed');
        profileModel.updateSyncResponseText(e.message);
        LOGGER.error('Error occurred while exporting customer profile: {0}', e.message);
    }

    return false;
}

module.exports.loggedIn = customerLoggedIn;
module.exports.created = customerCreated;
module.exports.synchronized = customerSynchronized;
module.exports.updated = customerUpdated;
