'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _compareAccountContactIdentifiers
 * @description Helper function to compare the AccountId / ContactIds returned by the B2CContactProcess flow against
 * an Account / Contact record that contains the expected Account / Contact identifiers.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 * @param preTestResult {Object} Represents the Account / Contact pair containing the identifiers to be validated
 * @private
 */
module.exports = function _compareAccountContactIdentifiers(processResults, preTestResult) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate that the Account and Contact resolved are the ones newly created
    assert.equal(processResult.outputValues.Account.Id, preTestResult.accountId, ' -- expected the Account objects (created and test-data) in this test to have the same Id value');
    assert.equal(processResult.outputValues.Contact.Id, preTestResult.contactId, ' -- expected the Contact objects (created and test-data) in this test to have the same Id value');

};
