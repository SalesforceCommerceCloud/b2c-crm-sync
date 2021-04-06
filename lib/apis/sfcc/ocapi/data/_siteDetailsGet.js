'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _siteDetailsGet
 * @description Retrieves the details for a given storefront from the OCAPI Data API
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} siteId Describes the identifier for the site being retrieved
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, siteId) => new Promise(async (resolve, reject) => {
    const ocapiUrlSuffix = `/sites/${siteId}`;

    try {
        // Create the base request definition
        const thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);
        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.get(thisRequestDef.url, thisRequestDef);
        resolve({
            url: thisRequestDef.url,
            status: responseObj.status,
            data: responseObj.data
        });
    } catch (e) {
        reject(e);
    }
});
