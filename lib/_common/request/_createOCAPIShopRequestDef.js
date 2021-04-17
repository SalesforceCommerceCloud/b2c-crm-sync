'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const buildOCAPIUrl = require('./_buildOCAPIUrl');
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function _createOCAPIShopRequestDef
 * @description Helper function to create a stubbed-out OCAPI shop-definition request
 *
 * @param {String} ocapiUrlSuffix Represents the OCAPI Shop API Url suffix
 * @param {String} siteId Represents the siteId to leverage when creating the shop-api request
 * @param {String} [clientId] Represents the clientId that should be appended to the request
 * @param {String} [authToken] Represents the authToken to leverage when creating the shop-api request
 * @return {Object} Returns an instance of the request definition object leveraged by axios
 */
module.exports = (ocapiUrlSuffix, siteId, clientId, authToken) => {

    // Initialize the request definition
    let output = {
        url: buildOCAPIUrl('shop', config.get('b2c.ocapiVersion'), ocapiUrlSuffix, false, siteId),
        headers: {}
    };

    // Append the clientId header if it's defined via the method arguments
    if (clientId !== undefined) { output.headers['x-dw-client-id'] = clientId; }

    // Append the authToken in the header if it's defined via the method arguments
    if (authToken !== undefined) { output.headers.Authorization = `Bearer ${authToken}`; }

    // Add-in the headers expected by the request
    let headers = {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    };

    // Apply each of the headers outlined to the current request
    Object.keys(headers).forEach(header => addGenericHeader(output, header, headers[header]));

    // Return the output variable
    return output;

};
