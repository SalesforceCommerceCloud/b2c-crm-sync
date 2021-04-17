'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateRegisteredUserContactUpdatesAreEqual
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that updated SFDC attributes match with their source B2C Commerce identifiers
 *
 * @param {Object} sfdcPatchResults Represents the patch / update results from working with the sfdc Contact record
 * @param {Object} b2cPatchResults Represents the patch / update results from working with the b2c Customer profile
 */
module.exports = function _validateRegisteredUserContactUpdatesAreEqual(sfdcPatchResults, b2cPatchResults) {

    // Validate that the SFDC Contact record properties do not match with its B2C Commerce Customer Profile counterpart
    assert.equal(sfdcPatchResults.HomePhone, b2cPatchResults.data.phone_home, ' -- SFDC and B2C home phone attributes do not match (and they should)');
    assert.equal(sfdcPatchResults.B2C_Job_Title__c, b2cPatchResults.data.job_title, ' -- SFDC and B2C job-title attributes do not match (and they should)');

};
