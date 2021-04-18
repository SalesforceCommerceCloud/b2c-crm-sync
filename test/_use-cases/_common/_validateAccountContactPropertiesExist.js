'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateAccountContactPropertiesExist
 * @description Helper function that validates the Salesforce Platform Account and Contact
 * properties exist in the B2CContactProcess response.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 */
module.exports = function _validateAccountContactPropertiesExist(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate that the Account and Contact objects are present in the outputValues
    assert.isTrue(processResult.outputValues.hasOwnProperty('Account'), ' -- expected the Account property to exist in the output object');
    assert.isTrue(processResult.outputValues.hasOwnProperty('Contact'), ' -- expected the Contact property to exist in the output object');
    assert.isObject(processResult.outputValues.Account, ' -- expected the Account object to exist in the output object');
    assert.isObject(processResult.outputValues.Contact, ' -- expected the Contact object to exist in the output object');

    // Validate that the Account and Contact Objects seeded with the correct properties
    assert.isTrue(processResult.outputValues.Account.hasOwnProperty('RecordTypeId'), ' -- expected the Account object to have a recordType relationship');
    assert.isTrue(processResult.outputValues.Account.hasOwnProperty('Id'), ' -- expected the Account object to have a primary key');
    assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('Id'), ' -- expected the Contact object to have a primary key');
    assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('AccountId'), ' -- expected the Account object to have an Account relationship');
    assert.equal(processResult.outputValues.Contact.AccountId, processResult.outputValues.Account.Id, ' -- expected the Account object Id and Contact relationship values to be the same');

};
