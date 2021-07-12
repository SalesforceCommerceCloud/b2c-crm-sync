'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function siteDetailsGet_FailureNock
 * @description Helper function used to create a nock that mimics retrieving a site
 * error from the B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @param {String} siteId Describes the site for which to generate a nock
 * @returns {nock.Scope} Returns an instance of a nock scope
 */
function siteDetailsGet_FailureNock(environmentDef, siteId) {

    // Initialize local variables
    let nockScope,
        basePathUrl,
        versionNo;

    // Shorthand the versionNo of the OCAPI API to use
    versionNo = config.get('b2c.ocapiVersion').toString();

    // Capture and calculate the basePath for the nock request
    basePathUrl = 'https://' + environmentDef.b2cHostName;

    // Define the nock interceptor for the site-get failure request
    nockScope = nock(basePathUrl)
        .filteringPath(function (path) {
            if (path.indexOf('/sites') !== -1) {
                return '/';
            }
            return false;

        })
        .get('/')
        .once()
        .reply(404, {
            _v: versionNo.replace('v', '').replace('_', '.'),
            fault: {
                arguments: {
                    siteId: siteId
                },
                type: 'SiteNotFoundException',
                message: `No site with ID ${siteId} could be found.`
            }
        });

    // Return the nock
    return nockScope;

}

module.exports = siteDetailsGet_FailureNock;
