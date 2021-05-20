'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _internalServerError_FailureNock
 * @description Helper function used to create a nock that mimics a generic
 * internal server error from the B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @param {String} [httpMethod] Describes the http-method used to influence the response
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _internalServerError_FailureNock(environmentDef, httpMethod) {

    // Initialize local variables
    let nockScope,
        numberOfRetries,
        baseNock,
        basePathUrl,
        versionNo;

    // Default the httpMethod if it's not defined
    if (httpMethod === undefined) { httpMethod = 'get'; }

    // Shorthand the versionNo of the OCAPI API to use
    versionNo = config.get('b2c.ocapiVersion').toString();

    // Default the total number of retries that should be configured
    numberOfRetries = config.get('b2c.retryCount').toString();

    // Default the base nock definition
    baseNock = {
        _v: versionNo.replace('v', '').replace('_', '.'),
        fault: {
            type: 'mega-failure',
            message: 'Internal Server Error'
        }
    };

    // Capture and calculate the basePath for the nock request
    basePathUrl = 'https://' + environmentDef.b2cHostName;

    // Define the nock interceptor for the site-get request
    nockScope = nock(basePathUrl)
        .filteringPath(function () {
            return '/';
        })
        .intercept('/', httpMethod.toUpperCase())
        .times(numberOfRetries)
        .reply(500, baseNock);

    // Return the nock
    return nockScope;

}

module.exports = _internalServerError_FailureNock;
