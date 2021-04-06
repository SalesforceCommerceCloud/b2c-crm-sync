'use strict';

// Initialize constants
const config = require('config');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');

/**
 * @function _b2cAuthClientCredentials
 * @description Attempts to authenticate against the B2C Commerce instance -- and returns
 * the results of the request via the CLI.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {}
        },
        outputDisplay: {}
    };

    try {
        output.apiCalls.authenticate.authToken = await b2cAuthenticate(environmentDef);
        output.outputDisplay.authToken = output.apiCalls.authenticate.authToken;
        resolve(output);
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);
    }
});
