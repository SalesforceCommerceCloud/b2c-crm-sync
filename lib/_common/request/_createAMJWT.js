'use strict';

// Initialize constants
const config = require('config');
const fs = require('fs');

// Initialize constants
const jwtLib = require('jsonwebtoken');

/**
 * @function _createAMJWT
 * @description Helper function to create a JWT token for B2C Commerce's AccountManager
 *
 * @param {Object} environmentDef Represents the environment details used to create the request
 * @return {Object} Returns an object containing the JWT properties
 */
module.exports = (environmentDef) => {

    // Initialize local variables
    let output,
        tokenHeader,
        tokenOptions;

    // Build out the authentication credential for the Business Manager User Grant
    const amProperties = config.util.toObject(config.get('b2c.accountManager'));
    const amUrl = `${amProperties.baseUrl}${amProperties.authUrl}`;
    const audienceUrl = `${amProperties.baseUrl}:${amProperties.port}${amProperties.authUrl}`;
    const certPath = config.get('paths.source.dx.certs-sfdc').toString();

    // Retrieve the certificate and key for the associated certificate
    const cert = fs.readFileSync(`${certPath}/${environmentDef.sfCertDeveloperName}.cert`);
    const key = fs.readFileSync(`${certPath}/${environmentDef.sfCertDeveloperName}.key`);

    // Initialize the jwt definition
    output = {
        amUrl: amUrl,
        audienceUrl: audienceUrl,
        jwt: {
            header: undefined,
            options: undefined,
            token: undefined,
            requestBody: undefined
        },
        verify: {
            success: false,
            results: {},
            error: undefined
        },
        certificate: {
            developerName: environmentDef.sfCertDeveloperName,
            cert: cert,
            key: key
        }
    };

    // Initialize the signature header
    tokenHeader = {
        alg: 'RS256',
        typ: 'JWT'
    };

    // Default the signature options
    tokenOptions = {
        header: tokenHeader,
        expiresIn: '25m',
        issuer: environmentDef.b2cClientId,
        subject: environmentDef.b2cClientId,
        audience: audienceUrl
    };

    // Attempt to sign the token
    output.jwt.header = tokenHeader;
    output.jwt.options = tokenOptions;
    output.jwt.token = jwtLib.sign({}, key, tokenOptions);

    // Build out the requestBody that will be used by the calling request
    output.jwt.requestBody = 'grant_type=client_credentials&client_assertion_type=urn%3Aietf%3Aparams%3' +
        `Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=${output.jwt.token}`;

    // Return the output variable
    return output;

};
