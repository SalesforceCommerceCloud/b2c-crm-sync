'use strict';

// Initialize constants
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');

/**
 * @function syncCustomerRegistration
 * @description This hook is used to synchronize customer registrations with the Salesforce Platform
 * triggered by OCAPI / headless interactions
 * @param {Object} customer Represents the customer being registered
 * @param {Object} customerRegistration Describes the post used to register a customer
 */
function syncCustomerRegistration(customer, customerRegistration) {

    // Create a reference to the OCAPI-check function
    let isOCAPIIntegrationEnabled = require('../../util/isOCAPIIntegrationEnabled');

    // Exit early if OCAPI Integration is not enabled
    if (!isOCAPIIntegrationEnabled()) { return; }

    // Call out that we're executing the customer-profile sync
    Logger.info('-- B2C-CRM-Sync: Customer Registration: Start: Sync via OCAPI');

    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.customer.created', 'created', customer.getProfile());

    // Call out that we're done executing the customer-profile sync
    Logger.info('-- B2C-CRM-Sync: Customer Registration: Stop: Sync via OCAPI');

    // Return an ok-status (authorizing the update)
    return new Status(Status.OK);

}

exports.afterPOST = syncCustomerRegistration;
