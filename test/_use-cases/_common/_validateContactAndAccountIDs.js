'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateContactAndAccountIDs
 * @description Helper function to compare the SFDCContact with a RegisteredUser -- and validate that the
 * Contact and Account identifiers are aligned for the B2C Customer Profile and its mapped Contact record.
 *
 * @param sfdcContact {Object} Represents the SFDC Contact record being compared
 * @param b2cRegisteredUser {Object} Represents the B2C Commerce Customer Profile being compared
 */
module.exports = function _validateContactAndAccountIDs(sfdcContact, b2cRegisteredUser) {

    // Validate that the SFDC Contact record exists and contains key properties
    assert.equal(sfdcContact.success, true, ' -- expected the success flag to have a value of true');
    assert.isTrue(sfdcContact.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
    assert.equal(sfdcContact.Id, b2cRegisteredUser.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
    assert.equal(sfdcContact.AccountId, b2cRegisteredUser.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

};
