'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _bmUserGrant
 * @description Generates a BM User Grant to authenticate the BM User
 *
 * @param {Object} environmentDef Represents the current environment configuration
 * @returns {Promise} Returns a promise that contains the authentication response
 */
module.exports = (environmentDef) => new Promise(async (resolve, reject) => {

    // Initialize constants used to generate the Business Manager User grant
    const ocapiUrlSuffix = `/dw/oauth2/access_token?client_id=${environmentDef.b2cClientId}`;
    const requestInstance = requestLib.createRequestInstance(environmentDef);

    try {

        // Create the base authentication request definition
        const thisRequestDef = requestLib.createOCAPIAuthRequestDef(ocapiUrlSuffix, environmentDef);

        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.post(
            thisRequestDef.url,
            'grant_type=urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken',
            thisRequestDef
        );

        resolve({
            url: thisRequestDef.url,
            status: responseObj.status,
            headers: responseObj.headers,
            data: responseObj.data
        });

    } catch (e) {

        reject(e);
    }

});
