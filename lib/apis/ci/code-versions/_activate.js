'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci');
const validate = require('validate.js');

/**
 * @function activateCodeVersion
 * @description Activate a code-version in a given environment
 *
 * @param {Object} environmentDef Represents the environment where a given code-version will be activated
 * @param {String} token Represents the authentication token for the given environment
 * @param {String} [codeVersion] Represents code version being activated
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, token, codeVersion) => new Promise((resolve, reject) => {
    // Has a code-version been specified?  If not, then default to the environment value
    if (codeVersion === undefined) {
        codeVersion = environmentDef.b2cCodeVersion;
    }

    // Leverage ci to activate the code-version for the specified instance
    ccci.code.activate(environmentDef.b2cHostName, codeVersion, token, activateErrorObj => {
        // Is the activation-result an error?  If so, then throw the error
        if (!validate.isEmpty(activateErrorObj) || validate.isObject(activateErrorObj)) {
            reject(`Unable to activate '${codeVersion}'; please verify it exists and check OCAPI permissions`);
            return;
        }

        resolve(true);
    });
});
