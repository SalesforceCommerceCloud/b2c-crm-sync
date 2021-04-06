'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _codeVersionsPatch_FailureNock
 * @description Helper function used to create a nock that mimics the failed activation
 * of code-versions from the B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @param {String} [httpMethod] Describes the http-method used to influence the response
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _codeVersionsPatch_FailureNock(environmentDef, httpMethod) {

    // Initialize local variables
    let nockScope,
        baseNock,
        basePathUrl,
        versionNo;

    // Default the httpMethod if it's not defined
    if (httpMethod === undefined) { httpMethod = 'get'; }

    // Shorthand the versionNo of the OCAPI API to use
    versionNo = config.get('b2c.ocapiVersion').toString();

    // Default the base nock definition
    baseNock = {
        _v: versionNo.replace('v', '').replace('_', '.'),
        fault: {
            arguments: {
                codeVersionId: environmentDef.b2cCodeVersion
            }
        }
    };

    // Default the 'codeVersion not found' message
    if (httpMethod === 'patch' || httpMethod === 'get') {
        baseNock.fault.type = 'CodeVersionIdNotFoundException';
        baseNock.fault.message = `The code version with ID '${environmentDef.b2cCodeVersion}' couldn't be found.`;
    }

    // Default the 'codeVersion already exists' message
    if (httpMethod === 'put') {
        baseNock.fault.type = 'CodeVersionIdAlreadyExistsException';
        baseNock.fault.message = `The code version ID '${environmentDef.b2cCodeVersion}' already exists.`;
    }

    // Capture and calculate the basePath for the nock request
    basePathUrl = 'https://' + environmentDef.b2cHostName;

    // Define the nock interceptor for the site-get request
    nockScope = nock(basePathUrl)
        .filteringPath(function (path) {
            if (path.indexOf('/code_versions') !== -1) {
                return '/';
            }
            return false;

        })
        .intercept('/', httpMethod.toUpperCase())
        .once()
        .reply(403, baseNock);

    // Return the nock
    return nockScope;

}

module.exports = _codeVersionsPatch_FailureNock;
