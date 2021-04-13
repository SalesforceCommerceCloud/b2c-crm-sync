'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');
const accountAPIs = require('../../../lib/qa/processes/_common/sfdc/account');

/**
 * @function sfdcAccountContactPurge
 * @description Helper function for B2C Customer profile / SFDC Account and Contact deletion.  This
 * function is used to remove our test-data records to ensure that no record-conflicts exist.
 *
 * @param {Connection} sfdcConnection Represents the active connection for SFDC provided via jsForce
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcConnection) => {

    // Initialize local variables
    let testProfile,
        defaultAccountName,
        output;

    // Retrieve the b2c customer profile template that we'll use to exercise this test
    testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
    defaultAccountName = config.get('unitTests.testData.defaultAccountName').toString();

    // Re-initialize the output variable
    output = {};

    // Check if the org has a contact scoped with the test Contact
    output.searchResults = await contactAPIs.getByEmail(
        sfdcConnection, testProfile.customer.email, 0);

    // Was a Contact record found for the customerList / email combination?
    if (output.searchResults.length > 0) {

        // Delete the related accounts via their Contact associations
        output.deleteResults = await contactAPIs.deleteAccountsByContacts(sfdcConnection, output.searchResults);

    }

    // Search for any orphaned accounts that weren't deleted
    output.searchResults = await accountAPIs.getByAccountName(sfdcConnection, defaultAccountName);

    // Was an account record found among the collection of orphaned accounts
    if (output.searchResults.length > 0) {

        // Delete the related accounts via their identifiers
        output.deleteResults = await accountAPIs.deleteAccountsById(sfdcConnection, output.searchResults);

    }

    // Return the output variable
    return output;

};
