'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _getGuestAuth_FailureNock
 * @description Helper function used to create a nock that mimics network interactions (ex.
 * external REST API requests) executed during unit tests
 *
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _getGuestAuth_FailureNock() {

    // Initialize local variables
    let nockScope,
        apiVersion,
        siteId,
        baseUrl;

    // Grab the default values we use for unit tests
    apiVersion = config.get('nockProperties.b2c.ocapi.version').toString();
    siteId = config.get('nockProperties.b2c.ocapi.invalidSiteId').toString();
    baseUrl = config.get('nockProperties.b2c.ocapi.shop.auth.guest').toString();

    // Create the default url to monitor via this nock
    baseUrl = baseUrl.replace('__vn__', apiVersion);
    baseUrl = baseUrl.replace('__site__', siteId);

    // Define the nock interceptor for the authentication request
    // noinspection SpellCheckingInspection
    nockScope = nock(config.get('unitTests.testData.b2cBaseUrl'))
        .post(baseUrl)
        .once()
        .reply(404, {
            _v: config.get('nockProperties.shopGuestAuth.authVersion'),
            fault: {
                arguments: {
                    siteId: config.get('nockProperties.b2c.ocapi.invalidSiteId')
                },
                type: config.get('nockProperties.shopGuestAuth.authErrorType'),
                message: config.get('nockProperties.shopGuestAuth.authErrorMessage')
            }
        });

    // Return the nock
    return nockScope;

}

module.exports = _getGuestAuth_FailureNock;
