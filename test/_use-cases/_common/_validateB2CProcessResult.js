'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @function _validateB2CProcessResult
 * @description Helper function that conducts generic validation against the processing
 * results produced from calling the B2CContactProcess service.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 */
module.exports = function _validateB2CProcessResult(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate the REST API response is well-formed
    assert.equal(processResults.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
    assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
    assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
    assert.isNull(processResult.outputValues.errors, ' -- expected no errors to be included in the processing results');
    assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
    assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

};
