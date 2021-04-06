'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci');

/**
 * @function authenticate
 * @description Attempts to authenticate the SFCC-CI client to work against a given environment
 *
 * @param {Object} environment Represents the environment to be authenticated against
 */
module.exports = environment => new Promise((resolve, reject) => {
    // Attempt to authenticate via the clientId / clientSecret specified
    ccci.auth.auth(environment.b2cClientId, environment.b2cClientSecret, (e, token) => {
        // Was an error caught?
        if (e) {
            reject(e);
            return;
        }

        // Execute the callback and pass-in the token
        resolve(token);
    });
});
