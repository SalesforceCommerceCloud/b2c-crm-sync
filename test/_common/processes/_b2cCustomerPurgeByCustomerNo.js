'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

/**
 * @function b2cCustomerPurge
 * @description Helper function for B2C Customer profile / SFDC Account and Contact deletion.  This
 * function is used to remove our test-data records to ensure that no record-conflicts exist.
 *
 * @param {String} b2cAdminAuthToken Represents the client-credential grant derived from B2C Commerce
 * @param {Connection} sfdcConnection Represents the active connection for SFDC provided via jsForce
 * @param {String} [b2cCustomerNo] Represents the b2cCustomerNo of the registered customer to delete
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (b2cAdminAuthToken, sfdcConnection, b2cCustomerNo) => {

    // Initialize local variables
    let environmentDef,
        customerListId,
        output;

    // Retrieve the runtime environment
    environmentDef = getRuntimeEnvironment();

    // Retrieve the site and customerList used to testing
    customerListId = config.get('unitTests.testData.b2cCustomerList').toString();

    // Re-initialize the output variable
    output = {};

    // Initialize the deleteProfile output results
    output.deleteSFDCContact = {};

    // Check if the org has a contact scoped with the test Contact
    output.deleteSFDCContact.searchResults = await contactAPIs.getByCustomerListCustomerNo(
        sfdcConnection, customerListId, b2cCustomerNo);

    // Was a Contact record found for the customerList / email combination?
    if (output.deleteSFDCContact.searchResults.length > 0) {

        // Delete the related accounts via their Contact associations
        output.deleteSFDCContact.deleteResults = await contactAPIs.deleteAccountsByContacts(
            sfdcConnection, output.deleteSFDCContact.searchResults);

    }

    // Initialize the deleteProfile output results
    output.deleteB2CProfile = {};

    // Evaluate if the test customer already exists in the B2C Commerce environment
    output.deleteB2CProfile = await dataAPIs.customerDelete(b2cRequestLib.createRequestInstance(environmentDef),
        b2cAdminAuthToken, customerListId, b2cCustomerNo);

    // Return the output variable
    return output;

}
