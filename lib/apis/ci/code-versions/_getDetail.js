'use strict';

// Initialize any required modules
const config = require('config');

// Initialize any helper libraries
const requestLib = require('../../../../lib/_common/request');

// Initialize the OCAPI data call to retrieve a code-version
const codeVersionGet = require('../../../../lib/apis/sfcc/ocapi/data/_codeVersionGet');

/**
 * @function _getCodeVersionDetail
 * @description Retrieve a code-version's details from a given environment definition
 *
 * @param {Object} environmentDef Represents the environment where a given code-version will be activated
 * @param {String} token Represents the authentication token for the given environment
 * @param {String} [codeVersion] Represents code version being activated
 * @returns {Promise} Returns the results of the code-version detail request
 */
module.exports = (environmentDef, token, codeVersion) => new Promise(async (resolve, reject) => {
    // Has a code-version been specified?  If not, then default to the environment value
    // eslint-disable-next-line no-param-reassign
    if (codeVersion === undefined) { codeVersion = environmentDef.b2cCodeVersion; }
    const b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

    // Leverage the B2C Commerce OCAPI Data API to retrieve the code-version for the specified instance
    try {
        const codeVersionDetails = await codeVersionGet(b2cRequestInstance, token, codeVersion);
        // Evaluate if the status property is present -- and throw an error if we're not successful
        // eslint-disable-next-line no-lonely-if
        if (!Object.prototype.hasOwnProperty.call(codeVersionDetails, 'status') || codeVersionDetails.status !== 200) {
            // Execute the callback and pass-through the error
            reject(config.get('errors.b2c.unableToRetrieveCodeVersion'));
            return;
        }

        // Otherwise, assume success and continue
        resolve(codeVersionDetails);
    } catch (e) {
        reject(config.get('errors.b2c.unableToRetrieveCodeVersion'));
    }
});
