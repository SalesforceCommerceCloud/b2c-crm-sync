'use strict';

// Initialize constants
const config = require('config');

// Include Account Manager clientCredential grant via JWT function
const jwtClientCredentialsGrant = require('../apis/sfcc/ocapi/auth/_amClientCredentialsGrantJWT');

/**
 * @function _b2cAuthJWT
 * @description Attempts to authenticate against the B2C Commerce Account Manager leveraging JWT.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {

    // Initialize the output
    const output = {
        apiCalls: {
            authenticate: {}
        },
        outputDisplay: [],
        errorOutputDisplay: []
    };

    try {

        // Execute the BM User authentication attempt
        output.apiCalls.authenticate = await jwtClientCredentialsGrant(environmentDef);

        // Was an authentication error caught?
        if (output.apiCalls.authenticate.status !== 200) {

            // Capture the error message
            output.success = false;

            // Build the output display
            output.errorOutputDisplay = [
                ['errorType', output.apiCalls.authenticate.data.error],
                ['errorMessage', output.apiCalls.authenticate.data.error_description]
            ];

        } else {

            // Capture the authToken and build out the display details
            output.authToken = output.apiCalls.authenticate.data.access_token;
            output.success = true;

            // Build the output display
            output.outputDisplay = [
                ['authToken', output.apiCalls.authenticate.data.access_token]
            ];

        }

        // Append the remaining common output attributes
        output.outputDisplay = output.outputDisplay.concat(output.outputDisplay, [
            ['requestUrl', output.apiCalls.authenticate.jwt.amUrl],
            ['audienceUrl', output.apiCalls.authenticate.jwt.audienceUrl],
            ['jwtHeader', JSON.stringify(output.apiCalls.authenticate.jwt.jwt.header, null, 4)],
            ['jwtOptions', JSON.stringify(output.apiCalls.authenticate.jwt.jwt.options, null, 4)]
        ]);

        // Resolve the request successfully
        resolve(output);

    } catch (e) {

        // Otherwise, throw an error
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);

    }

});
