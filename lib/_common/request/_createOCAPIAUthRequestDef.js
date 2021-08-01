'use strict';

// Initialize local libraries
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function _createOCAPIAuthRequestDef
 * @description Helper function to create a stubbed-out OCAPI Auth request
 *
 * @param {String} OCAPISuffix Represents the OCAPI-Suffix to leverage
 * @param {Object} environmentDef Represents the environmentDefinition to leverage
 * @return {Object} Returns an instance of the request definition object leveraged by axios
 */
module.exports = (OCAPISuffix, environmentDef) => {

    let output,
        unEncodedPassword,
        bufferPassword,
        encodedPassword;

    // Build out the authentication credential for the Business Manager User Grant
    const authUrl = `https://${environmentDef.b2cHostName}/dw/oauth2/access_token?client_id=${environmentDef.b2cClientId}`;

    // Generate the encoded password that will be used to generate the authToken
    unEncodedPassword = `${environmentDef.b2cUsername}:${environmentDef.b2cAccessKey}:${environmentDef.b2cClientSecret}`;
    bufferPassword = Buffer.from(unEncodedPassword);
    encodedPassword = bufferPassword.toString('base64');

    // Initialize the request definition
    output = {
        url: `${authUrl}`,
        headers: {}
    };

    // Add-in the headers expected by the request
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        Authorization: 'Basic ' + encodedPassword,
        Connection: 'keep-alive'
    };

    // Apply each of the headers outlined to the current request
    Object.keys(headers).forEach(header => addGenericHeader(output, header, headers[header]));

    // Return the output variable
    return output;

};
