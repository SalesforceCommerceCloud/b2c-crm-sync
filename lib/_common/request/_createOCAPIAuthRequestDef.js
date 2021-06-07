'use strict';

// Initialize local libraries
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function _createOCAPIAuthRequestDef
 * @description Helper function to create a stubbed-out OCAPI Auth request
 *
 * @param {String} ocapiUrlSuffix Represents the OCAPI Data API Url suffix
 * @param {Object} environmentDef Represents the environment details used to create the authRequest
 * @return {Object} Returns an instance of the request definition object leveraged by axios
 */
module.exports = (ocapiUrlSuffix, environmentDef) => {

    let output,
        authCredential,
        authCredentialBuffer,
        authCredentialBase64;

    // Build out the authentication credential for the Business Manager User Grant
    authCredential = `${environmentDef.b2cUsername}:${environmentDef.b2cAccessKey}:${environmentDef.b2cClientSecret}`;
    authCredentialBuffer = Buffer.from(authCredential, 'utf8');
    authCredentialBase64 = authCredentialBuffer.toString('base64');

    // Initialize the request definition
    output = {
        url: `https://${environmentDef.b2cHostName}${ocapiUrlSuffix}`,
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

    // Add the credential-encoded string as an authorization header
    output = addGenericHeader(output, 'Authorization', `Basic ${authCredentialBase64}`);

    // Return the output variable
    return output;

};
