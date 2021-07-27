'use strict';

var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site');

/**
 * @function afterPOST
 * @description This hook is used to synchronize customer with the Salesforce Platform at order placement
 * triggered by OCAPI / headless interactions
 *
 * @param {Object} order Represents the order being placed
 * @returns {Status} Returns the status for the OCAPI request
 */
function afterPOST(order) {
    if (!Site.getCurrent().getCustomPreferenceValue('b2ccrm_syncCustomersFromOrdersViaOCAPI') || !require('dw/system/HookMgr').hasHook('app.order.created')) {
        return new Status(Status.OK);
    }

    var LOGGER = Logger.getLogger('int_b2ccrmsync', 'hooks.ocapi.shop.order.afterPOST');
    // Call out that we're executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Order Placement: Start: Sync via OCAPI');
    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.order.created', 'created', order);
    // Call out that we're done executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Order Placement: Stop: Sync via OCAPI');
    // Return an ok-status (authorizing the creation)
    return new Status(Status.OK);
}

module.exports.afterPOST = afterPOST;
