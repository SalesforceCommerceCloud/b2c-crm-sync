'use strict';

/**
 * @module hooks/order.process
 */

/**
 * @type {dw/system/Logger}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'hooks.order.process');

/**
 * Order created
 * Ensure the customer sync is enabled, and if so, process the customer sync with the Salesforce platform from the given order
 *
 * @param {dw/order/Order} order
 */
function orderCreated(order) {
    if (!require('../util/helpers').isIntegrationEnabled() || !order) {
        return;
    }

    // Ensure the order sync is also enabled
    // We sync profiles from order ONLY IF
    // - Either we enabled sync from all orders, the current order is a registered one, and the profile tied to the order has not been synched yet
    // - Either we enabled sync for guest orders, and the order is a guest one
    var Site = require('dw/system/Site').getCurrent();
    var isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersFromOrdersEnabled');
    var isSyncOnlyGuestEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersFromGuestOrdersOnlyEnabled');
    if (!isSyncEnabled || (isSyncEnabled && (isSyncOnlyGuestEnabled && order.getCustomer().getProfile())) && require('../util/helpers').sfdcContactIDIdentifierPresent(order.getCustomer().getProfile())) {
        return;
    }

    handleProcess(order, 'order create');
}

/**
 * This method will send the given profile based on the given {order} details to Salesforce Core through REST API
 *
 * @param {dw/order/Order} order
 * @param {String} action The action that triggered the process (createn)
 */
function handleProcess(order, action) {
    var ServiceMgr = require('../services/ServiceMgr');
    var model = order.getCustomer().getProfile() ? new (require('../models/customer'))(order.getCustomer().getProfile()) : new (require('../models/order'))(order);

    try {
        // Set the profile status, meaning that we start the export process
        model.updateStatus('not_exported');
        var requestBody = model.getProcessRequestBody();
        LOGGER.info('Exporting the customer profile to Salesforce core from order "{0}". Here is the request body: {1}', order.getOrderNo(), requestBody);
        var result = ServiceMgr.callRestService('customer', 'process', requestBody);

        // Error while calling the service
        // The service did not returned a 20x response
        if (result.status !== 'OK') {
            model.updateStatus('failed');
            model.updateSyncResponseText(require('dw/util/StringUtils').format('Status {0} ({1}): {2}', result.error, result.msg, result.errorMessage));
            LOGGER.error('Error occurred while exporting customer profile from order "{0}": {1}({2}): {3}', order.getOrderNo(), result.status, result.msg, result.errorMessage);
            return;
        }

        // The flow always return multiple values, but we only get the first one
        var resultObject = result.object[0];

        // The service returned a 20x response, but with an error in the response body
        if (resultObject.isSuccess === false) {
            var errorsAsString = JSON.stringify(resultObject.errors);
            model.updateStatus('failed');
            model.updateSyncResponseText(errorsAsString);
            LOGGER.error('Error occurred while exporting customer profile from order "{0}": {1}', order.getOrderNo(), errorsAsString);
            return;
        }

        // The export succeed
        LOGGER.info('Successfully exported the customer profile from the order "{0}". Here is the response body: {1}', order.getOrderNo(), JSON.stringify(resultObject));
        model.updateExternalId(resultObject.outputValues.Contact.AccountId, resultObject.outputValues.Contact.Id);
        model.updateStatus('exported');
        model.updateSyncResponseText(require('dw/util/StringUtils').format('Successfully exported to Salesforce Core platform during the "{0}" logic.', action));
    } catch (e) {
        model.updateStatus('failed');
        model.updateSyncResponseText(e.message);
        LOGGER.error('Error occurred while exporting customer profile from order "{0}": {1}', order.getOrderNo(), e.message);
    }
}

module.exports.created = orderCreated;
