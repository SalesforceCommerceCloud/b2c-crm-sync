'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

/**
 * @function _codeVersionsGet_SuccessNock
 * @description Helper function used to create a nock that mimics retrieving a code-versions from
 * the B2C Commerce OCAPI Data API
 *
 * @param {environmentDef} environmentDef Represents the runtime environment used to generate the request
 * @param {Number} [instanceCount] Describes the total number of authNocks should be created
 * @return {nock.Scope} Returns an instance of a nock scope
 */
function _codeVersionsGet_SuccessNock(environmentDef, instanceCount) {

    // Initialize local variables
    let nockScope,
        basePathUrl,
        versionNo;

    // Default the instanceCount if it's not undefined
    if (instanceCount === undefined) { instanceCount = 1; }

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
        .times(instanceCount)
        .reply(200, {
            _v: versionNo.replace('v', '').replace('_', '.'),
            _type: 'code_version_result',
            _count: 2,
            data: [
                {
                    _type: 'code_version',
                    activation_time: '2020-12-16T17:14:11Z',
                    active: true,
                    cartridges: [
                        'app_storefront_base',
                        'bm_app_storefront_base',
                        'lib_productlist',
                        'modules',
                        'plugin_applepay',
                        'plugin_cartridge_merge',
                        'plugin_datadownload',
                        'plugin_giftregistry',
                        'plugin_instorepickup',
                        'plugin_productcompare',
                        'plugin_sitemap',
                        'plugin_wishlists'
                    ],
                    compatibility_mode: '19.10',
                    id: 'SFRA_510',
                    last_modification_time: '2020-12-16T17:14:11Z',
                    rollback: false,
                    web_dav_url: basePathUrl + '/on/demandware.servlet/webdav/Sites/Cartridges/SFRA_510'
                },
                {
                    _type: 'code_version',
                    active: false,
                    compatibility_mode: '19.10',
                    id: 'version1',
                    last_modification_time: '2020-12-16T13:51:46Z',
                    rollback: true,
                    web_dav_url: basePathUrl + '/on/demandware.servlet/webdav/Sites/Cartridges/version1'
                }

            ]
        });

    // Return the nock
    return nockScope;

}

module.exports = _codeVersionsGet_SuccessNock;
