'use strict';

// Initialize constants
const Logger = require('dw/system/Logger');
const Status = require('dw/system/Status');

/**
 * @function syncCustomerUpdate
 * @description This hook is used to synchronize customer profile updates with the
 * Salesforce Platform triggered by OCAPI / headless interactions
 * @param {Object} customer Represents the customer being updated
 * @param {Object} customerRegistration Describes the post used to update the customer profile
 */
function syncCustomerUpdate(customer, customerRegistration) {

    // Create a reference to the OCAPI-check function
    let isOCAPIIntegrationEnabled = require('../../util/isOCAPIIntegrationEnabled');

    // Exit early if OCAPI Integration is not enabled
    if (!isOCAPIIntegrationEnabled()) { return; }

    // Call out that we're executing the customer-profile sync
    Logger.info('-- B2C-CRM-Sync: Customer Profile Update: Syncing Customer Profile via OCAPI');

    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.customer.created', 'updated', customer.getProfile());

    // Return an ok-status (authorizing the update)
    return new Status(Status.OK);

}

exports.afterPATCH = syncCustomerUpdate;
