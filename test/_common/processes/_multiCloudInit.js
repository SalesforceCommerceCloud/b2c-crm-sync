'use strict';

// Initialize local libraries
const ciAPIs = require('../../../lib/apis/ci');
const sfdcAuth = require('../../../lib/apis/sfdc/auth');

/**
 * @function multiCloudInit
 * @description Helper function to retrieve the authorization tokens used for REST API interactions
 *
 * @param {Object} environmentDef Represents the configuration for the current environment
 * @return {Object} Returns an object summary containing the authToken properties
 */
module.exports = async (environmentDef) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let b2cAdminAuthToken,
        sfdcAuthCredentials;

    try {

        // Shorthand the B2C administrative authToken
        b2cAdminAuthToken = await ciAPIs.authenticate(environmentDef);

        // Audit the authorization token for future rest requests
        sfdcAuthCredentials = await sfdcAuth.authUserCredentials(
            environmentDef.sfLoginUrl,
            environmentDef.sfUsername,
            environmentDef.sfPassword,
            environmentDef.sfSecurityToken);

        // Resolve and continue
        resolve({
            b2cAdminAuthToken: b2cAdminAuthToken,
            sfdcAuthCredentials: sfdcAuthCredentials
        });

    } catch (e) {

        // Audit the error if one is thrown
        reject(e);

    }

});
