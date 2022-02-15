'use strict';

/**
 * @private
 * @function sessionHandler
 * @description Overriding the session-initialization to handle the Order-On-Behalf from Service-Cloud for guest customers.
 * For guest customers, PlaceHolder customer is used to establish an Auth between SC & CC. This is to create an agent session.
 * Once the auth is created, this PlaceHolder session is explicitly invalidated, but the agent context remains active.
 */
function sessionHandler() {

    // Initialize constants
    var Site = require('dw/system/Site').getCurrent();
    var CustomerMgr = require('dw/customer/CustomerMgr');

    // Initialize local Variables
    var isSyncEnabled,
        OOBOGuestCustomerId;

    // First, evaluate if b2c-crm-sync is enabled
    isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncIsEnabled');

    // Exit early the integration isn't enabled
    if (isSyncEnabled) {

        // Otherwise, evaluate if the OOBO / anonymous customer scenario is valid; Get the OOBO placeholder customerId value
        OOBOGuestCustomerId = Site.getCustomPreferenceValue('b2ccrm_syncOOBOGuestCustomerId');

        // Is the current customer the OOBO placeholder customer? If so, then logout the customer
        if (session.customer && session.customerAuthenticated && OOBOGuestCustomerId && session.customer.ID === OOBOGuestCustomerId) {

            // Logout the customer -- but maintain the agent session
            CustomerMgr.logoutCustomer(false);
        }
    }
}

exports.onSession = sessionHandler;
