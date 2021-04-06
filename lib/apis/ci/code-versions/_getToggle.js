'use strict';

// Initialize local libraries
const getAllCodeVersions = require('./_getAll');
const findToggleCodeVersion = require('./_common/_findToggle');

/**
 * @function getToggleCodeVersion
 * @description Attempts to retrieve the active / configured code-version
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} token Represents the authentication token to use to verify the environment
 *
 * @returns {Promise}
 */
module.exports = (environment, token) => new Promise(async (resolve, reject) => {
    try {
        // First, let's retrieve the code-versions for the current instance
        const codeVersions = await getAllCodeVersions(environment, token);
        // Return the code-version identified as active
        resolve(findToggleCodeVersion(codeVersions.data));
    } catch (e) {
        reject(e);
    }
});
