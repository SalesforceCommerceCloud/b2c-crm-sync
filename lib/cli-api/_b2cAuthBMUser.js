'use strict';

// Initialize constants
const config = require('config'),
    b2cAuthBMUser = require('../apis/sfcc/ocapi/auth/_bmUserGrant');

/**
 * @function _b2cAuthBMUserGrant
 * @description Attempts to authenticate against the B2C Commerce instance using BM User credentials --
 * and returns the results of the request via the CLI.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the BMUserGrant authentication results
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {

    // Initialize the output
    const output = {
        apiCalls: {
            authenticate: {}
        },
        outputDisplay: {}
    };

    try {

        // Execute the BM User authentication attempt
        output.apiCalls.authenticate = await b2cAuthBMUser(environmentDef);

        // Was an authentication error caught?
        if (output.apiCalls.authenticate.status !== 200) {

            // Capture the error message
            output.success = false;

            // Build the output display
            output.outputDisplay = [
                ['errorType', output.apiCalls.authenticate.data.error],
                ['errorMessage', output.apiCalls.authenticate.data.error_description]
            ];

        } else {

            // Capture the authToken and build out the display details
            output.authToken = output.apiCalls.authenticate.data.access_token;
            output.success = true;

            // Build the output display
            output.outputDisplay = [output.apiCalls.authenticate.data.access_token];
        }

        resolve(output);

    } catch (e) {

        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);

    }

});
