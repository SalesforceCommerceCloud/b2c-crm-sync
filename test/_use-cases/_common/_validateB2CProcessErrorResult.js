'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateB2CProcessErrorResult
 * @description Helper function that conducts generic validation against the processing
 * results produced from calling the B2CContactProcess service.  This function checks
 * specifically for generic error conditions.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 */
module.exports = function _validateB2CProcessErrorResult(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate the REST API response is well-formed
    assert.equal(processResults.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
    assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
    assert.isFalse(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return false -- as resolving multiple records generates an error');
    assert.isTrue(processResult.outputValues.errors.length > 0, ' -- expected at least one (1) error to be returned by the errors collection');
    assert.isNull(processResult.outputValues.Account, ' -- expected the Account object to be null / empty');
    assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

};
