'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateWithB2CIdentifiers
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that B2C Commerce Profile and SFDC record have corresponding B2C identifiers
 *
 * @param sfdcContact {Object} Represents the SFDC Contact record being compared
 * @param b2cRegisteredUser {Object} Represents the B2C Commerce Customer Profile being compared
 */
module.exports = function _validateB2CIdentifiers(sfdcContact, b2cRegisteredUser) {

    // Validate that the email address and customerId attributes is aligned across both records
    assert.equal(sfdcContact.B2C_Customer_ID__c, b2cRegisteredUser.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
    assert.equal(sfdcContact.B2C_Customer_No__c, b2cRegisteredUser.data.customer_no, ' -- SFDC and B2C CustomerNo attributes do not match');

};
