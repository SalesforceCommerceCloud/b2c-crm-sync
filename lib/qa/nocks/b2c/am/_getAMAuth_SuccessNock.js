'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _getAMAuthSuccessNock
 * @description Helper function used to create a nock that mimics network interactions (ex.
 * external REST API requests) executed during unit tests
 *
 * @param {Number} [instanceCount] Describes the total number of authNocks should be created
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _getAMAuth_SuccessNock(instanceCount) {

    // Initialize local variables
    let nockScope;

    // Default the instanceCount if it's not undefined
    if (instanceCount === undefined) { instanceCount = 1; }

    // Define the nock interceptor for the authentication request
    // noinspection SpellCheckingInspection
    nockScope = nock(config.get('b2c.accountManager.baseUrl'))
        .post(config.get('b2c.accountManager.authUrl'))
        .times(instanceCount)
        .reply(200, {
            access_token: config.get('nockProperties.accountManager.accessToken'),
            scope: config.get('nockProperties.accountManager.scope'),
            token_type: config.get('nockProperties.accountManager.tokenType'),
            expires_in: config.get('nockProperties.accountManager.expiresIn')
        });

    // Return the nock
    return nockScope;

}

module.exports = _getAMAuth_SuccessNock;
