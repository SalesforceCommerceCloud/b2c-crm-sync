'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _codeVersionsGet_FailureNock
 * @description Helper function used to create a nock that mimics the failed retrieval
 * of code-versions from the B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _codeVersionsGet_FailureNock(environmentDef) {

    // Initialize local variables
    let nockScope,
        basePathUrl,
        versionNo;

    // Shorthand the versionNo of the OCAPI API to use
    versionNo = config.get('b2c.ocapiVersion').toString();

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
        .get('/')
        .once()
        .reply(403, {
            _v: versionNo.replace('v', '').replace('_', '.'),
            fault: {
                arguments: {
                    method: 'GET',
                    path: `/data/${versionNo}/code_versions`
                },
                type: 'ClientAccessForbiddenException',
                message: `Access to resource 'GET /data/${versionNo}/code_versions' isn't allowed for the current client.`
            }
        });

    // Return the nock
    return nockScope;

}

module.exports = _codeVersionsGet_FailureNock;
