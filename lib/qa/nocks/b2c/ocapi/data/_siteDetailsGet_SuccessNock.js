'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _siteDetailsGet_SuccessNock
 * @description Helper function used to create a nock that mimics retrieving a site from the
 * B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @param {String} siteId Describes the site for which to generate a nock
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _siteDetailsGet_SuccessNock(environmentDef, siteId) {

    // Initialize local variables
    let nockScope,
        basePathUrl,
        versionNo,
        customerListId;

    // Shorthand the versionNo of the OCAPI API to use
    versionNo = config.get('b2c.ocapiVersion').toString();

    // Create a reference to the current customerList
    customerListId = config.get('unitTests.testData.b2cSiteCustomerLists.' + siteId).toString();

    // Capture and calculate the basePath for the nock request
    basePathUrl = 'https://' + environmentDef.b2cHostName;

    // Define the nock interceptor for the site-get request
    nockScope = nock(basePathUrl)
        .filteringPath(function (path) {
            if (path.indexOf('/sites') !== -1) {
                return '/';
            }
            return false;

        })
        .get('/')
        .once()
        .reply(200, {
            _v: versionNo.replace('v', '').replace('_', '.'),
            _type: 'site',
            cartridges: 'app_storefront_base',
            customer_list_link: {
                _type: 'customer_list_link',
                customer_list_id: customerListId,
                link: `${environmentDef.b2cHostName}/s/-/dw/data/${versionNo}/customer_lists/${customerListId}`
            },
            display_name: {
                default: siteId
            },
            id: siteId,
            in_deletion: false,
            link: `${environmentDef.b2cHostName}/s/-/dw/data/${versionNo}/sites/${siteId}`,
            storefront_status: 'online'
        });

    // Return the nock
    return nockScope;

}

module.exports = _siteDetailsGet_SuccessNock;
