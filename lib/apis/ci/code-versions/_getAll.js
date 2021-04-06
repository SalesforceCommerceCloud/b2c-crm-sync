'use strict';

// Initialize any required modules
const config = require('config');
const ccci = require('sfcc-ci');
const validate = require('validate.js');

/**
 * @function getAllCodeVersions
 * @description Attempts to retrieve all configured code-versions for a given B2C Commerce environment.
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} token Represents the authentication token to use to verify the environment
 *
 * @returns {Promise}
 */
module.exports = (environment, token) => new Promise((resolve, reject) => {
    // First, let's retrieve the code-versions for the current instance
    ccci.code.list(environment.b2cHostName, token, (errorObj, listResponse) => {
        // Was a valid error found?
        if (!validate.isEmpty(errorObj) || validate.isObject(errorObj)) {
            // If so, then throw the error and call-out that we're unable to get the code versions
            reject(config.get('errors.b2c.unableToRetrieveCodeVersions'));
            return;
        }

        // Return the code-version identified as active
        resolve(listResponse);
    });
});
