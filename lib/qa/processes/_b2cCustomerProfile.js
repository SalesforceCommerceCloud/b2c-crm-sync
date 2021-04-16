'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const ciAPIs = require('../../../lib/apis/ci');
const requestLib = require('../../../lib/_common/request');
const common = require('./_common/sfcc');

/**
 * @function b2cCustomerProfile
 * @description This function is used execute the repeatable registration of a B2C Commerce Customer
 * for the current environment using test-data -- as part of e2e testing of use-cases.
 *
 * @param {Object} envDef Represents the current environment definition used to process testing
 * @param {String} customerListId Represents the current customerList being used for testing
 * @param {String} siteId Represents the current siteId being used for testing
 * @returns {Promise} Returns the promise containing the request processing results
 */
module.exports = async (envDef, customerListId, siteId) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        baseRequest,
        testProfile,
        updateProfile,
        resetProfile,
        adminAuthToken,
        customerAuthToken,
        guestAuthToken;

    // Audit the default attributes
    output = {
        baseStatus: {
            success: false,
            environmentDef: envDef,
            siteId: siteId
        }
    };

    try {

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
        updateProfile = config.util.toObject(config.get('unitTests.testData.updateTemplate'));
        resetProfile = config.util.toObject(config.get('unitTests.testData.resetTemplate'));

        // Initialize the base request leveraged by this process
        baseRequest = requestLib.createRequestInstance(envDef);

        ////////////////////////////////////////////////////////////////////
        // BEGIN: B2C Commerce Customer Profile Gymnastics
        ////////////////////////////////////////////////////////////////////

        // Retrieve the guestAuthorization token from B2C Commerce
        output.getB2CGuestAuth = await shopAPIs.authAsGuest(envDef, siteId, envDef.b2cClientId);

        // Shorthand the authToken for the guest user
        guestAuthToken = output.getB2CGuestAuth.authToken;

        // Shorthand the B2C administrative authToken
        adminAuthToken = await ciAPIs.authenticate(envDef);

        // Evaluate if the test customer already exists in the B2C Commerce environment
        output.searchForB2CProfile = await dataAPIs.customerSearchByEmail(
            baseRequest, adminAuthToken, customerListId, testProfile.customer.email);

        // Was a customer profile found?  If so, then delete it
        if (common.wasB2CProfileFound(output.searchForB2CProfile)) {

            // Evaluate if the test customer already exists in the B2C Commerce environment
            output.deleteB2CProfile = await dataAPIs.customerDelete(
                requestLib.createRequestInstance(envDef), adminAuthToken, customerListId, common.getFirstCustomerNo(output.searchForB2CProfile.data.hits));

        }

        // Register the B2C Commerce customer profile
        output.registerB2CProfile = await shopAPIs.customerPost(
            envDef, siteId, envDef.b2cClientId, guestAuthToken, testProfile);

        // Was a customer profile found?  If so, then delete it
        if (common.wasB2CProfileRegistered(output.registerB2CProfile)) {

            // Retrieve the guestAuthorization token from B2C Commerce
            output.getB2CCustomerAuth = await shopAPIs.authAsRegistered(envDef, siteId, envDef.b2cClientId, testProfile.customer.login, testProfile.password);

            // Create a reference to the customer authToken
            customerAuthToken = output.getB2CCustomerAuth.authToken;

            // Update the B2C Commerce customer profile
            output.updateB2CProfile = await shopAPIs.customerPatch(
                envDef, siteId, envDef.b2cClientId, customerAuthToken, output.getB2CCustomerAuth.profile.customerId, updateProfile);

            // Reset the B2C Commerce customer profile
            output.resetB2CProfile = await shopAPIs.customerPatch(
                envDef, siteId, envDef.b2cClientId, customerAuthToken, output.getB2CCustomerAuth.profile.customerId, resetProfile);

            // Delete the registered B2C Commerce customer profile
            output.deleteRegisteredB2CProfile = await dataAPIs.customerDelete(
                requestLib.createRequestInstance(envDef), adminAuthToken, customerListId, output.getB2CCustomerAuth.profile.customerNo);

        }

        ////////////////////////////////////////////////////////////////////
        //  END: B2C Commerce Customer Profile Gymnastics
        ////////////////////////////////////////////////////////////////////

        // Audit the default attributes
        output.baseStatus.success = true;

        // Resolve the promise
        resolve(output);

    } catch (e) {

        // Capture the error
        output.error = e;

        // Reject the promise
        reject(output);

    }

});
