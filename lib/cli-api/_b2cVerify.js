'use strict';

// Initialize constants
const config = require('config');

// Include the helper library to retrieve the environment details
const b2cAuthenticate = require('./_b2cAuthClientCredentials');
const verifySites = require('./_b2cSitesVerify');
const verifyCodeVersion = require('./_b2cCodeVersionVerify');

/**
 * @function _b2cVerify
 * @description Attempts to validate that the B2C Configuration, sites, and specified
 * code version all exist and are valid representations of the specified B2C Commerce environment
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            verifySites: {},
            verifyCodeVersion: {}
        },
        outputDisplay: {
            authenticate: {}
        }
    };

    // Authenticate first
    try {
        // Audit the authorization token for future rest requests
        const authResult = await b2cAuthenticate(environmentDef);
        output.apiCalls.authenticate = authResult.apiCalls.authenticate;
        output.outputDisplay.authenticate = authResult.outputDisplay;
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);
        return;
    }

    // Then verify sites
    try {
        const verifySitesResult = await verifySites(environmentDef);
        output.outputDisplay.verifySites = verifySitesResult.outputDisplay.verifySites;
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToVerifySites')}: ${e}`);
        return;
    }

    // Finally verify code version
    try {
        const verifyCodeVersionResult = await verifyCodeVersion(environmentDef);
        output.outputDisplay.verifyCodeVersion = verifyCodeVersionResult.outputDisplay.codeVersionGet;
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToVerifyCodeVersions')}: ${e}`);
        return;
    }

    resolve(output);
});
