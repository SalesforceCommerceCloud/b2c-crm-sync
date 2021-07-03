'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function getAMAuthSuccessNock
 * @description Helper function used to create a nock that mimics network interactions (ex.
 * external REST API requests) executed during unit tests
 *
 * @param {Number} [instanceCount] Describes the total number of authNocks should be created
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function getAMAuth_SuccessNock(instanceCount) {

    // Initialize local variables
    let nockScope,
        apiVersion,
        siteId,
        baseUrl;

    // Default the instanceCount if it's not undefined
    // eslint-disable-next-line no-param-reassign
    if (instanceCount === undefined) { instanceCount = 1; }

    // Grab the default values we use for unit tests
    apiVersion = config.get('nockProperties.b2c.ocapi.version').toString();
    siteId = config.get('nockProperties.b2c.ocapi.siteId').toString();
    baseUrl = config.get('nockProperties.b2c.ocapi.shop.auth.guest').toString();

    // Create the default url to monitor via this nock
    baseUrl = baseUrl.replace('__vn__', apiVersion);
    baseUrl = baseUrl.replace('__site__', siteId);

    // Define the nock interceptor for the authentication request
    // noinspection SpellCheckingInspection
    nockScope = nock(config.get('unitTests.testData.b2cBaseUrl'))
        .post(baseUrl)
        .times(instanceCount)
        .reply(200, {
            _v: config.get('nockProperties.shopGuestAuth.authVersion'),
            _type: config.get('nockProperties.shopGuestAuth.authGrantType'),
            auth_type: config.get('nockProperties.shopGuestAuth.authType'),
            customer_id: config.get('nockProperties.shopGuestAuth.authCustomerId'),
            preferred_locale: config.get('nockProperties.shopGuestAuth.authPreferredLocale')
        });

    // Return the nock
    return nockScope;

}

module.exports = getAMAuth_SuccessNock;
