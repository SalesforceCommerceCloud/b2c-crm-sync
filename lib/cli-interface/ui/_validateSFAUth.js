'use strict';

// Initialize constants
const outputResults = require('./_outputResults');
const sfAuthUserCredentials = require('../../cli-api/_sfAuthUserCredentials');

/**
 * @function validateSFAUth
 * @description Validate that we can auth to the SalesforceOrg
 *
 * @param {Object} environmentDef Represents environmentDetails that are used to auth
 * @returns {Object} Returns the authenticationResults
 */
module.exports = async (environmentDef) => {

    // Initialize local variables
    let resultObj;

    // Attempt to authenticate against the SF instance leveraging the user credentials
    resultObj = await sfAuthUserCredentials(environmentDef);

    // Display the user-credential authentication results
    outputResults([resultObj.outputDisplay], undefined, 'cliTableConfig.sfAuthTokenOutput');

    // Return the validation results
    return resultObj;

};
