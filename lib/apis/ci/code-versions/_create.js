'use strict';

// Initialize any required modules
const config = require('config');

// Initialize any helper libraries
const requestLib = require('../../../../lib/_common/request');

// Initialize the OCAPI data call to create a code-version
const codeVersionPut = require('../../../../lib/apis/sfcc/ocapi/data/_codeVersionPut');

/**
 * @function createCodeVersion
 * @description Create a code-version in a given environment
 *
 * @param {Object} environmentDef Represents the environment where a given code-version will be created
 * @param {String} token Represents the authentication token for the given environment
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, token) => new Promise(async (resolve, reject) => {
    try {
        const b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

        // Leverage the B2C Commerce OCAPI Data API to create the code-version for the specified instance
        const createResult = await codeVersionPut(b2cRequestInstance, token, environmentDef.b2cCodeVersion);
        // Evaluate if the status property is present -- and throw an error if we're not successful
        if (!createResult.hasOwnProperty('status') || createResult.status !== 200) {
            // Execute the callback and pass-through the error
            reject(config.get('errors.b2c.unableToCreateCodeVersion'));
            return;
        }

        // Otherwise, assume success and continue
        resolve(true);
    } catch (e) {
        reject(config.get('errors.b2c.unableToCreateCodeVersion'));
    }
});
