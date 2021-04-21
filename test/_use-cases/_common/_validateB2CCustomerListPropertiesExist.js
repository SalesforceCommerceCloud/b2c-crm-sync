'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateB2CCustomerListPropertiesExist
 * @description Helper function that validates the B2C CustomerList properties are found in
 * a given B2CContactProcess result.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 */
module.exports = function _validateB2CCustomerListPropertiesExist(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate that the customerList properties are seeded
    assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList_ID__c'), ' -- expected the Contact object to have a B2C CustomerList static reference');
    assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList__c'), ' -- expected the Contact object to have a B2C CustomerList object-relationship reference');

}
