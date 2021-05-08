'use strict';

// Initialize local libraries
const flowAPIs = require('../../../lib/qa/processes/_common/sfdc/flow');

// Initialize individual library helpers
const validateB2CProcessErrorResult = require('./_validateB2CProcessErrorResult');

/**
 * @function _executeAndVerifyB2CProcessErrorResult
 * @description Helper function to perform common retrieval and validation for all B2CContactProcess requests
 * with the expectation that an error show be generated via the processing result
 *
 * @param environmentDef {Object} Represents the environment definition used to drive this request
 * @param sfdcAccessToken {String} Represents the accessToken used to authenticate against the Salesforce Platform
 * @param resolveBody {Object} Represents the object containing the sourceContact to be resolved
 */
module.exports = async function _executeAndVerifyB2CProcessErrorResult(environmentDef, sfdcAccessToken, resolveBody) {

    // Initialize local variables
    let output;

    // Execute the contactProcess service
    output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAccessToken, resolveBody);

    // Process the generated output from the service -- and confirm errors
    validateB2CProcessErrorResult(output);

    // Return the output property
    return output;

};
