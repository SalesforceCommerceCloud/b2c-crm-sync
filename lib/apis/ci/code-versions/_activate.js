'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci'),
    validate = require('validate.js');

/**
 * @function activateCodeVersion
 * @description Activate a code-version in a given environment
 *
 * @param {Object} environmentDef Represents the environment where a given code-version will be activated
 * @param {String} token Represents the authentication token for the given environment
 * @param {String} [codeVersion] Represents code version being activated
 *
 * @returns {Promise} Returns a promise containing the processed details
 */
module.exports = (environmentDef, token, codeVersion) => new Promise((resolve, reject) => {
    // Verify that the code-version has been passed-in; if not, use the one in the environment file
    // eslint-disable-next-line no-undefined,no-param-reassign
    if (codeVersion === undefined) { codeVersion = environmentDef.codeVersion; }

    // Leverage ci to activate the code-version for the specified instance
    ccci.code.activate(environmentDef.b2cHostName, codeVersion, token, activateErrorObj => {
        // Is the activation-result an error?  If so, then throw the error
        if (!validate.isEmpty(activateErrorObj) || validate.isObject(activateErrorObj)) {
            reject(`Unable to activate '${codeVersion}'; please verify it exists and check OCAPI permissions`);
        } else {
            resolve(true);
        }
    });
});
