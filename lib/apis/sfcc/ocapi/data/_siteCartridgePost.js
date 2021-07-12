'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _siteCartridgeAdd
 * @description Adds the specified cartridge to the site's cartridge path
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} siteId Describes the identifier for the site being updated
 * @param {Object} messageBody Describes the message body to include in the service call
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, siteId, messageBody) => new Promise(async (resolve, reject) => {
    const ocapiUrlSuffix = `/sites/${siteId}/cartridges`;

    try {
        // Create the base request definition
        const thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken, true);
        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.post(thisRequestDef.url, messageBody, thisRequestDef);
        resolve({
            url: thisRequestDef.url,
            status: responseObj.status,
            data: responseObj.data
        });
    } catch (e) {
        reject(e);
    }
});
