'use strict';

// Initialize constants
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');

/**
 * @function syncCustomerLogin
 * @description This hook is used to synchronize customer profile updates with the
 * Salesforce Platform triggered by a remote OCAPI / headless login
 * @param {Object} customer Represents the customer being updated
 * @param {Object} customerAuth Describes the post used to authenticate the customer
 */
function syncCustomerLogin(customer, customerAuth) {

    // Create a reference to the OCAPI-check function
    let isOCAPIIntegrationEnabled = require('../../util/isOCAPIIntegrationEnabled');

    // Exit early if OCAPI Integration is not enabled
    if (!isOCAPIIntegrationEnabled() || !customer.isAuthenticated()) { return; }

    // Call out that we're executing the customer-profile sync
    Logger.info('-- B2C-CRM-Sync: Customer Login: Start: Sync via OCAPI');

    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.customer.loggedIn', 'loggedIn', customer.getProfile());

    // Call out that we're done executing the customer-profile sync
    Logger.info('-- B2C-CRM-Sync: Customer Login: Finish: Sync via OCAPI');

    // Return an ok-status (authorizing the update)
    return new Status(Status.OK);

}

exports.afterPOST = syncCustomerLogin;
