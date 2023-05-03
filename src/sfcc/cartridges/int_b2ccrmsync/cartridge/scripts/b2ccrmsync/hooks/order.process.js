// noinspection ES6ConvertVarToLetConst

'use strict';

/**
 * @module hooks/order.process
 */

/**
 * @type {dw/system/Log}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'hooks.order.process');

/**
 * Order created
 * Ensure the customer sync is enabled, and if so, process the customer sync with the Salesforce platform from the given order
 *
 * @param {dw/order/Order} order
 */
function orderCreated(order) {

    // Exit early if integration is not enabled
    if (!require('*/cartridge/scripts/b2ccrmsync/util/helpers').isIntegrationEnabled() || !order) {
        return;
    }

    // Ensure the order sync is also enabled
    // We sync profiles from order ONLY IF
    // - Either we enabled sync from all orders, the current order is a registered one, and the profile tied
    //   to the order has not been synchronized yet
    // - Either we enabled sync for guest orders, and the order is a guest one
    var Site = require('dw/system/Site').getCurrent();
    var isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersFromOrdersEnabled');
    var isSyncGuestOrdersEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersFromGuestOrdersEnabled');
    var isSyncProfileIDsEnabled = Site.getCustomPreferenceValue('b2ccrm_syncApplyProfileIDsToRegisteredOrdersEnabled');
    var customerProfile = order.getCustomer().getProfile();

    // Exit early is sync is not enabled
    if (!isSyncEnabled) {
        return;

    }

    // Verify that sync is enabled, guestOrdersOnly is enabled, and our order is anonymous
    if (!(isSyncEnabled && ((isSyncGuestOrdersEnabled && customerProfile == null) || (isSyncProfileIDsEnabled && customerProfile != null)))) {
        return;
    }

    handleProcess(order, 'order create');

}

/**
 * This method will send the given profile based on the given {order} details to Salesforce Core through REST API
 *
 * @param {dw/order/Order} order
 * @param {String} action The action that triggered the process (created)
 */
function handleProcess(order, action) {
    var ServiceMgr = require('*/cartridge/scripts/b2ccrmsync/services/ServiceMgr');
    var model;

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

    try {

        // If we already have a contactId present -- then just update the order with the Account / Contact details
        if (require('*/cartridge/scripts/b2ccrmsync/util/helpers').sfdcContactIDIdentifierPresent(order.getCustomer().getProfile())) {

            // Shorthand access to the customer profile
            var thisCustomer = order.getCustomer().getProfile();

            // Re-initialize the model using the specified order
            model = new (require('*/cartridge/scripts/b2ccrmsync/models/order'))(order);

            // Attempt the write the Account and Contact identifiers to the specified order
            model.updateExternalId(thisCustomer.custom.b2ccrm_accountId, thisCustomer.custom.b2ccrm_contactId);
            model.updateStatus('applied_identifiers');
            model.updateSyncResponseText(require('dw/util/StringUtils').format('Successfully applied the registered user\'s profile identifiers during the "' + action + '" logic.'));

        } else {
            model = !empty(order.getCustomer().getProfile()) ? new (require('*/cartridge/scripts/b2ccrmsync/models/customer'))(order.getCustomer().getProfile()) : new (require('*/cartridge/scripts/b2ccrmsync/models/order'))(order);
            model.updateStatus('not_exported');

            var requestBody = model.getRequestBody();
            LOGGER.info('Exporting the customer profile to Salesforce core from order {0}. Here is the request body: {1}', order.getOrderNo(), requestBody);
            var result = ServiceMgr.callRestService('customer', 'process', requestBody);

            // Error while calling the service
            // The service did not returned a 20x response
            if (result.status !== 'OK') {
                model.updateStatus('failed');
                model.updateSyncResponseText(require('dw/util/StringUtils').format('Status {0} ({1}): {2}', result.error, result.msg, result.errorMessage));
                LOGGER.error('Error occurred while exporting customer profile from order {0}: {1}({2}): {3}', order.getOrderNo(), result.status, result.msg, result.errorMessage);
                return;
            }

            // The flow always return multiple values, but we only get the first one
            var resultObject = result.object[0];

            // The service returned a 20x response, but with an error in the response body
            if (resultObject.isSuccess === false) {
                var errorsAsString = JSON.stringify(resultObject.errors);
                model.updateStatus('failed');
                model.updateSyncResponseText(errorsAsString);
                LOGGER.error('Error occurred while exporting customer profile from order {0}: {1}', order.getOrderNo(), errorsAsString);
                return;
            }

            // The export succeed
            LOGGER.info('Successfully exported the customer profile from the order {0}. Here is the response body: {1}', order.getOrderNo(), JSON.stringify(resultObject));
            model.updateExternalId(resultObject.outputValues.Contact.AccountId, resultObject.outputValues.Contact.Id);
            model.updateStatus('exported');
            model.updateSyncResponseText(require('dw/util/StringUtils').format('Successfully exported to Salesforce Platform during the "{0}" logic.', action));
        }
    } catch (e) {
        model.updateStatus('failed');
        model.updateSyncResponseText(e.message);
        LOGGER.error('Error occurred while exporting customer profile from order {0}: {1}', order.getOrderNo(), e.message);
    }
}

module.exports.created = orderCreated;
