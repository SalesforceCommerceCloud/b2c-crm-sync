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
 * @param {Object} environmentDef Represents the environment definition being processed
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcConnection, environmentDef) => {

    // Initialize local variables
    let accountType,
        defaultAccountName,
        emailDomain,
        filterPersonAccounts,
        output;

    // Retrieve the default account name and email domain to locate the test SFDC Contacts and Accounts to delete
    defaultAccountName = config.get('unitTests.testData.defaultAccountName').toString();
    emailDomain = config.get('unitTests.testData.emailDomain').toString();

    // get scratch org account type - used to filter out person accounts
    accountType = environmentDef.sfScratchOrgProfile;
    filterPersonAccounts = accountType === 'personaccounts';

    // Re-initialize the output variable
    output = {};

    // Check if the org has a contact scoped with the test Contact
    output.searchResults = await contactAPIs.getByEmail(
        sfdcConnection, emailDomain, 0, filterPersonAccounts);

    // Was a Contact record found for the specific email domain
    if (output.searchResults.length > 0) {

        // Delete the related accounts via their Contact associations
        output.deleteResults = await contactAPIs.deleteAccountsByContacts(sfdcConnection, output.searchResults);

    }

    // Search for any orphaned accounts that weren't deleted
    output.searchResults = await accountAPIs.getByAccountName(sfdcConnection, defaultAccountName, emailDomain, filterPersonAccounts);

    // Was an account record found among the collection of orphaned accounts
    if (output.searchResults.length > 0) {

        // Delete the related accounts via their identifiers
        output.deleteResults = await accountAPIs.deleteAccountsById(sfdcConnection, output.searchResults);

    }

    // Return the output variable
    return output;

};
