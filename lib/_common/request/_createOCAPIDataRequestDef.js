'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const buildOCAPIUrl = require('./_buildOCAPIUrl');
const addBearerToken = require('./_addBearerToken');
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function _createOCAPIDataRequestDef
 * @description Helper function to create a stubbed-out OCAPI data-definition request
 *
 * @param {String} ocapiUrlSuffix Represents the OCAPI Data API Url suffix
 * @param {String} accessToken Represents the access token used to auth this request
 * @param {Boolean} [includeBMSite] Describes if the Business Manager site should be included in the url
 * @return {Object} Returns an instance of the request definition object leveraged by axios
 */
module.exports = (ocapiUrlSuffix, accessToken, includeBMSite = true) => {

    // Initialize the request definition
    let output = {
        url: buildOCAPIUrl('data', config.get('b2c.ocapiVersion'), ocapiUrlSuffix, includeBMSite),
        headers: {}
    };

    // Add-in the headers expected by the request
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    };

    // Apply each of the headers outlined to the current request
    Object.keys(headers).forEach(header => addGenericHeader(output, header, headers[header]));

    // Add the credential-encoded string as an authorization header
    output = addBearerToken(output, accessToken);

    // Return the output variable
    return output;

};
