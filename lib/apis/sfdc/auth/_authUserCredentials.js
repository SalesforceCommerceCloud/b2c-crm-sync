'use strict';

// Initialize constants
const jsforce = require('jsforce');

/**
 * @function _authSFDCUserCredentials
 * @description This function is used to generate an SFDC REST API authentication token using
 * the user credentials specified via the environment configuration file.
 *
 * @param {String} loginUrl Describes the loginUrl to leverage in the authentication process
 * @param {String} userName Describes the userName to leverage in the authentication process
 * @param {String} password Describes the password to leverage in the authentication process
 * @param {String} securityToken Describes the securityToken to leverage in the authentication process
 * @returns {Promise} Returns the jsForce connection details (or authentication error)
 */
module.exports = (loginUrl, userName, password, securityToken) => new Promise((resolve, reject) => {
    // Initialize the connection with the login-url
    const authPassword = `${password}${securityToken}`,
        connection = new jsforce.Connection({
            loginUrl: `https://${loginUrl}`
        });

    // Attempt to login using the environment-specific username and password
    connection.login(userName, authPassword)
        .then(loginUserInfo => resolve({
            accessToken: connection.accessToken,
            instanceUrl: connection.instanceUrl,
            userId: loginUserInfo.id,
            orgId: loginUserInfo.organizationId,
            conn: connection
        }))
        .catch(e => reject(e));
});
