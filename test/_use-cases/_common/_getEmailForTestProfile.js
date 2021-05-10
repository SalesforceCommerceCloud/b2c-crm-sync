'use strict';

// Initialize the email generation library
const randomEmail = require('random-email');
const config = require('config');

/**
 * @function _getEmailForTestProfile
 * @description Helper function to generate a random email for use in profiles
 *
 * @returns {String} Returns a random email address to leverage in tests
 */
module.exports = function _getEmailForTestProfile() {

    // Initialize local Variables
    let output;

    // Generate the email address to leverage
    output = randomEmail({ domain: config.get('unitTests.testData.emailDomain') });

    // Return the email
    return output;

};
