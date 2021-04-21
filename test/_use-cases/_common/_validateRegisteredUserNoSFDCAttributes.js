'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateRegisteredUserNoSFDCAttributes
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that SFDC attributes are not created on a B2C Customer Profile
 *
 * @param {Object} b2cRegResults Represents the registration / authentication results for a given unit-test being evaluated
 */
module.exports = function _validateRegisteredUserNoSFDCAttributes(b2cRegResults) {

    // Validate that the registration is well-formed and contains the key properties we expect
    assert.equal(b2cRegResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
    assert.isTrue(b2cRegResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
    assert.equal(b2cRegResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
    assert.isFalse(b2cRegResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to not see the c_b2ccrm_accountId property in the B2C Commerce response');
    assert.isFalse(b2cRegResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to not see the c_b2ccrm_contactId property in the B2C Commerce response');

};

