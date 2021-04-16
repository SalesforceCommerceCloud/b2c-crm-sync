'use strict';


/**
 * @function afterPOST
 * @description This hook is used to synchronize customer profile updates with the
 * Salesforce Platform triggered by a remote OCAPI / headless login
 * @param {Object} customer Represents the customer being updated
 * @param {Object} customerAuth Describes the post used to authenticate the customer
 */
function afterPOST(customer, customerAuth) {
    var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'hooks.ocapi.shop.auth.afterPOST');
    var Status = require('dw/system/Status');
    var Site = require('dw/system/Site');

    if (!Site.getCurrent().getCustomPreferenceValue('b2ccrm_syncCustomersViaOCAPI') || !customer.isAuthenticated()) {
        return;
    }

    // Call out that we're executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Customer Login: Start: Sync via OCAPI');
    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.customer.loggedIn', 'loggedIn', customer.getProfile());
    // Call out that we're done executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Customer Login: Finish: Sync via OCAPI');
    // Return an ok-status (authorizing the auth)
    return new Status(Status.OK);
}

module.exports.afterPOST = afterPOST;
