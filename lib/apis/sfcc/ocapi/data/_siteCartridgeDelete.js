'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _siteCartridgeRemove
 * @description Removes the specified cartridge from the site's cartridge path
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} siteId Describes the identifier for the site being updated
 * @param {String} cartridgeId Describes the identifier for the cartridge
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, siteId, cartridgeId) => new Promise(async (resolve, reject) => {
    const ocapiUrlSuffix = `/sites/${siteId}/cartridges/${cartridgeId}`;

    try {
        // Create the base request definition
        const thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);
        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.delete(thisRequestDef.url, thisRequestDef);
        resolve({
            url: thisRequestDef.url,
            status: responseObj.status,
            data: responseObj.data
        });

    } catch (e) {
        reject(e);

    }
});
