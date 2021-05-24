'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');
const b2cCommon = require('../../../lib/qa/processes/_common/sfcc');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const sfdcAccountContactPurge = require('./_sfdcAccountContactPurge');

/**
 * @function b2cCustomerPurge
 * @description Helper function for B2C Customer profile / SFDC Account and Contact deletion.  This
 * function is used to remove our test-data records to ensure that no record-conflicts exist.
 *
 * @param {String} b2cAdminAuthToken Represents the client-credential grant derived from B2C Commerce
 * @param {Connection} sfdcConnection Represents the active connection for SFDC provided via jsForce
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (b2cAdminAuthToken, sfdcConnection) => {

    // Initialize local variables
    let baseRequest,
        b2cCustomerNoToDelete,
        environmentDef,
        customerListId,
        testProfile,
        output;

    // Retrieve the runtime environment
    environmentDef = getRuntimeEnvironment();

    // Retrieve the site and customerList used to testing
    customerListId = config.get('unitTests.testData.b2cCustomerList').toString();

    // Retrieve the b2c customer profile template that we'll use to exercise this test
    testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));

    // Initialize the base request leveraged by this process
    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

    // Re-initialize the output variable
    output = {};

    // Initialize the deleteProfile output results
    output.deleteB2CProfile = {};

    // Evaluate if the test customer already exists in the B2C Commerce environment
    output.deleteB2CProfile.searchResultsByEmail = await dataAPIs.customerSearchByEmail(
        baseRequest, b2cAdminAuthToken, customerListId, testProfile.customer.email);

    // Was a customer profile found?  If so, then delete it
    if (b2cCommon.wasB2CProfileFound(output.deleteB2CProfile.searchResultsByEmail)) {

        // Initialize the b2c customerNo to delete (place it in a local variable)
        b2cCustomerNoToDelete = b2cCommon.getFirstCustomerNo(output.deleteB2CProfile.searchResultsByEmail.data.hits);

        // Evaluate if the test customer already exists in the B2C Commerce environment
        output.deleteB2CProfile.deleteResultsByEmail = await dataAPIs.customerDelete(
            b2cRequestLib.createRequestInstance(environmentDef),
            b2cAdminAuthToken,
            customerListId,
            b2cCustomerNoToDelete);

    }

    // Evaluate if the test customer already exists in the B2C Commerce environment
    output.deleteB2CProfile.searchResultsByLogin = await dataAPIs.customerSearchByLogin(
        baseRequest, b2cAdminAuthToken, customerListId, testProfile.customer.email);

    // Was a customer profile found?  If so, then delete it
    if (b2cCommon.wasB2CProfileFound(output.deleteB2CProfile.searchResultsByLogin)) {

        // Initialize the b2c customerNo to delete (place it in a local variable)
        b2cCustomerNoToDelete = b2cCommon.getFirstCustomerNo(output.deleteB2CProfile.searchResultsByLogin.data.hits);

        // Evaluate if the test customer already exists in the B2C Commerce environment
        output.deleteB2CProfile.deleteResultsByLogin = await dataAPIs.customerDelete(
            b2cRequestLib.createRequestInstance(environmentDef),
            b2cAdminAuthToken,
            customerListId,
            b2cCustomerNoToDelete);

    }

    // Purge the Account / Contact relationships
    output.sfdcPurgeResults = await sfdcAccountContactPurge(sfdcConnection, environmentDef);

    // Return the output variable
    return output;

};
