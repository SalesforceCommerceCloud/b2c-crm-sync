'use strict';

// Initialize local libraries
const getAllCodeVersions = require('./_getAll');
const findToggleCodeVersion = require('./_common/_findToggle');

/**
 * @function getToggleCodeVersion
 * @description Attempts to toggle the active code-version to in-active -- and re-activates
 * the original code-version to "toggle" the originally active code-version's status
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} token Represents the authentication token to use to verify the environment
 * @returns {Promise} Returns the results of the toggle request
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
