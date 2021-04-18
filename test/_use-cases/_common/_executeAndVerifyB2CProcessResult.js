'use strict';

// Initialize local libraries
const flowAPIs = require('../../../lib/qa/processes/_common/sfdc/flow');

// Initialize individual library helpers
const validateB2CProcessResult = require('./_validateB2CProcessResult');
const validateContactProperties = require('./_validateContactProperties');
const validateAccountContactPropertiesExist = require('./_validateAccountContactPropertiesExist');

/**
 * @function _executeAndVerifyB2CProcessResult
 * @description Helper function to perform common retrieval and validation for all B2CContactProcess requests
 *
 * @param environmentDef {Object} Represents the environment definition used to drive this request
 * @param sfdcAccessToken {String} Represents the accessToken used to authenticate against the Salesforce Platform
 * @param resolveBody {Object} Represents the object containing the sourceContact to be resolved
 */
module.exports = async function _executeAndVerifyB2CProcessResult(environmentDef, sfdcAccessToken, resolveBody) {

    // Initialize local variables
    let output;

    output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAccessToken, resolveBody);

    console.log(resolveBody.inputs[0].sourceContact);
    console.log(output.data[0]);

    // Attempt to validate the processing-result
    validateB2CProcessResult(output);

    // Attempt to verify that the contactProperty values are aligned
    validateContactProperties(output, resolveBody.inputs[0].sourceContact);

    // Verify that the Account / Contact properties exist in the service-output
    validateAccountContactPropertiesExist(output);

    // Create a shorthand reference to the Account / Contact identifiers
    output.contactId = output.data[0].outputValues.Contact.Id;
    output.accountId = output.data[0].outputValues.Account.Id;

    // Return the output property
    return output;

};

