'use strict';

// Initialize constants
const config = require('config');

// Include B2C Commerce API functions
const sfAuthenticate = require('../apis/sfdc/auth/_authUserCredentials');

/**
 * @function _sfAuthUserCredentials
 * @description Attempts to authenticate against the ST instance leveraging existing
 * user credentials -- and returns the results of the request via the CLI.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the result of the authentication attempt
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            sfAuthenticate: {
                authResults: undefined,
                error: undefined
            }
        },
        outputDisplay: []
    };

    try {
        // Audit the authorization token for future rest requests
        output.apiCalls.sfAuthenticate.authResults = await sfAuthenticate(
            environmentDef.sfLoginUrl,
            environmentDef.sfUsername,
            environmentDef.sfPassword,
            environmentDef.sfSecurityToken);

        // Output the result of the authentication attempt
        output.outputDisplay.push(output.apiCalls.sfAuthenticate.authResults.accessToken);

        resolve(output);

    } catch (e) {

        reject(`${config.get('errors.sf.unableToAuthenticate')}`);

    }
});
