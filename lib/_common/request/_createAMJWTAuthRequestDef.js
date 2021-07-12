'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function _createOCAPIAuthRequestDef
 * @description Helper function to create a stubbed-out OCAPI Auth request
 *
 * @return {Object} Returns an instance of the request definition object leveraged by axios
 */
module.exports = () => {

    let output;

    // Build out the authentication credential for the Business Manager User Grant
    const amProperties = config.util.toObject(config.get('b2c.accountManager'));
    const amUrl = `${amProperties.baseUrl}${amProperties.authUrl}`;

    // Initialize the request definition
    output = {
        url: `${amUrl}`,
        headers: {}
    };

    // Add-in the headers expected by the request
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    };

    // Apply each of the headers outlined to the current request
    Object.keys(headers).forEach(header => addGenericHeader(output, header, headers[header]));

    // Return the output variable
    return output;

};
