'use strict';

// Initialize constants
const config = require('config');
const colors = require('colors');

// Initialize local libraries
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');
const b2cCommon = require('../../../lib/qa/processes/_common/sfcc');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const sfdcAccountContactPurge = require('./_sfdcAccountContactPurge');
const sleep = require('./_sleep');

/**
 * @function b2cCustomersPurge
 * @description Helper function for B2C Customer profiles / SFDC Account and Contacts deletion.  This
 * function is used to remove our test-data records to ensure that no record-conflicts exist.
 *
 * @param {String} b2cAdminAuthToken Represents the client-credential grant derived from B2C Commerce
 * @param {Connection} sfdcConnection Represents the active connection for SFDC provided via jsForce
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (b2cAdminAuthToken, sfdcConnection) => {

    // Initialize local variables
    let baseRequest,
        emailDomain,
        b2cCustomerNoToDelete,
        customerSearchResult,
        environmentDef,
        customerListId,
        output;

    // Retrieve the runtime environment
    environmentDef = getRuntimeEnvironment();

    // Retrieve the site and customerList used to testing
    customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
    emailDomain = config.get('unitTests.testData.emailDomain').toString();

    // Initialize the base request leveraged by this process
    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

    // Re-initialize the output variable
    output = {};

    // Initialize the deleteProfile output results
    output.deleteB2CProfile = {};

    // Evaluate if the test customer already exists in the B2C Commerce environment
    output.deleteB2CProfile.searchResultsByEmail = await dataAPIs.customerSearchByEmail(
        baseRequest, b2cAdminAuthToken, customerListId, emailDomain);

    // Was a customer profile found?  If so, then delete it
    if (b2cCommon.wasB2CProfileFound(output.deleteB2CProfile.searchResultsByEmail)) {

        // Loop over the collection of search results
        for (let searchIndex = 0; searchIndex < output.deleteB2CProfile.searchResultsByEmail.data.hits.length; searchIndex++) {

            // Create a reference to the current customerSearch result to process
            customerSearchResult = output.deleteB2CProfile.searchResultsByEmail.data.hits[searchIndex];

            // Initialize the b2c customerNo to delete (place it in a local variable)
            b2cCustomerNoToDelete = customerSearchResult.data.customer_no;

            // Audit out for the unit tests that we've deleted / purged the test B2C Commerce Customer
            console.log(`        -- purging B2C Commerce Customer No. ${b2cCustomerNoToDelete} (temporary customer record)`.grey);

            // Evaluate if the test customer already exists in the B2C Commerce environment
            output.deleteB2CProfile.deleteResultsByEmail = await dataAPIs.customerDelete(
                b2cRequestLib.createRequestInstance(environmentDef),
                b2cAdminAuthToken,
                customerListId,
                b2cCustomerNoToDelete);

            // Implement a pause before exiting
            await sleep(config.get('unitTests.testData.sleepTimeout'));

        }

    }

    // Purge the Account / Contact relationships
    output.sfdcPurgeResults = await sfdcAccountContactPurge(sfdcConnection, environmentDef);

    // Implement a pause before exiting
    await sleep(config.get('unitTests.testData.sleepTimeout'));

    // Return the output variable
    return output;

};
