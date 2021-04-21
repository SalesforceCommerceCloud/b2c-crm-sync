'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateRegisteredUserPatchResults
 * @description Helper function to validate that a B2C Commerce Customer was successfully patched and their
 *
 * @param b2cRegisteredUser {Object} Represents the B2C Commerce Customer profile that was patched
 */
module.exports = function _validateRegisteredUserPatchResults(b2cRegisteredUser) {

    // Validate that the registration is well-formed and contains the key properties we expect
    assert.equal(b2cRegisteredUser.status, 200, ' -- expected a 200 status code from B2C Commerce');
    assert.isTrue(b2cRegisteredUser.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
    assert.isTrue(b2cRegisteredUser.data.hasOwnProperty('job_title'), ' -- expected to see the job_title property in the B2C Commerce response');
    assert.isTrue(b2cRegisteredUser.data.hasOwnProperty('phone_home'), ' -- expected to see the home_phone property in the B2C Commerce response');

};

