'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _getAMAuth_FailureNock
 * @description Helper function used to create a nock that mimics network interactions (ex.
 * external REST API requests) executed during unit tests
 *
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _getAMAuth_FailureNock() {

    // Initialize local variables
    let nockScope;

    // Define the nock interceptor for the authentication request
    // noinspection SpellCheckingInspection
    nockScope = nock(config.get('b2c.accountManager.baseUrl'))
        .post(config.get('b2c.accountManager.authUrl'))
        .once()
        .reply(400, {
            error_description: config.get('nockProperties.accountManager.authErrorDescription'),
            error: config.get('nockProperties.accountManager.authError')
        });

    // Return the nock
    return nockScope;

}

module.exports = _getAMAuth_FailureNock;
