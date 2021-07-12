'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _jwtClientCredentialsGrant
 * @description Generates a Client Credential Grant request to authenticate against Account Manager via JWT
 *
 * @param {Object} environmentDef Represents the current environment configuration
 * @returns {Promise} Returns a promise that contains the authentication response
 */
module.exports = (environmentDef) => new Promise(async (resolve, reject) => {

    // Define the requestInstance to leverage
    const requestInstance = requestLib.createRequestInstance(environmentDef);

    try {

        // Create the base authentication request definition
        const thisRequestDef = requestLib.createAMJWTAuthRequestDef(),
            jwtToken = requestLib.createAMJWT(environmentDef),
            responseObj = await requestInstance.post(
                thisRequestDef.url,
                jwtToken.jwt.requestBody,
                thisRequestDef
            );

        resolve({
            url: thisRequestDef.url,
            status: responseObj.status,
            headers: responseObj.headers,
            data: responseObj.data,
            jwt: jwtToken
        });

    } catch (e) {
        reject(e);
    }

});
