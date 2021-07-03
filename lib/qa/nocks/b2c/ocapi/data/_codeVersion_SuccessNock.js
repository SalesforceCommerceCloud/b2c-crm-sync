'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function codeVersion_SuccessNock
 * @description Helper function used to create a nock that mimics updating an existing code
 * version http response via the B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @param {String} [httpMethod] Describes the http-method used to influence the response
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function codeVersion_SuccessNock(environmentDef, httpMethod) {

    // Initialize local variables
    let nockScope,
        baseNock,
        basePathUrl,
        versionNo;

    // Default the httpMethod if it's not defined
    // eslint-disable-next-line no-param-reassign
    if (httpMethod === undefined) { httpMethod = 'get'; }

    // Shorthand the versionNo of the OCAPI API to use
    versionNo = config.get('b2c.ocapiVersion').toString();

    // Capture and calculate the basePath for the nock request
    basePathUrl = 'https://' + environmentDef.b2cHostName;

    // Default the base-nock to leverage
    baseNock = {
        _v: versionNo.replace('v', '').replace('_', '.'),
        _type: 'code_version',
        _resource_state: '532d796f59e6c673d45ec8e87c801ad230b63ae7fc2d40f9a8f6eca5f93907f8',
        active: false,
        compatibility_mode: versionNo.replace('v', '').replace('_', '.'),
        id: environmentDef.b2cCodeVersion,
        last_modification_time: '2020-12-16T13:51:46Z',
        rollback: false,
        web_dav_url: `https://${environmentDef.b2cHostName}/on/demandware.servlet/webdav/` +
            'Sites/Cartridges/${environmentDef.b2cCodeVersion}'
    };

    // Is the httpMethod a patch (ex. an activation event)
    if (httpMethod === 'patch') {

        // If so, then update the status properties
        baseNock.active = true;
        baseNock.activation_time = '2020-12-28T01:10:44Z';

    }

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
        .reply(200, baseNock);

    // Return the nock
    return nockScope;

}

module.exports = codeVersion_SuccessNock;
