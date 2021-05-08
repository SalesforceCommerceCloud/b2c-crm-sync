'use strict';

// Initialize constants
const colors = require('colors');

// Initialize local libraries for B2C Commerce
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');

/**
 * @function b2cCustomerRegister
 * @description Helper function to remotely register a B2C Commerce Customer
 *
 * @param {Object} environmentDef Represents the current development environment being processes
 * @param {String} b2cAdminAuthToken Represents the client-credential grant derived from B2C Commerce
 * @param {String} siteId Represents the siteId to which a customer will register through
 * @param {Object} customerProfile Represents the customer-profile to process for registration
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (environmentDef, b2cAdminAuthToken, siteId, customerProfile) => {

    // Initialize local Variables
    let output,
        b2cGuestAuth;

    // Default the output variable
    output = {};

    // Retrieve the guestAuthorization token from B2C Commerce
    b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

    // Register the B2C Commerce customer profile
    output.response = await shopAPIs.customerPost(
        environmentDef, siteId, environmentDef.b2cClientId, b2cGuestAuth.authToken, customerProfile);

    // Audit the customerNo of the newly registered customer
    output.registeredB2CCustomerNo = output.response.data.customer_no;
    output.b2cGuestAuth = b2cGuestAuth;

    // Audit the customer record being created to support the current unit-test
    console.log(`        -- created B2C Customer Number ${output.registeredB2CCustomerNo} as ${customerProfile.customer.email}`.grey);

    // Return the output variable
    return output;

};

