'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _codeVersionGet
 * @description Retrieves the details of a code-version based on the CLI arguments
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} codeVersionId Describes the identifier for the site being retrieved
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, codeVersionId) => new Promise(async (resolve, reject) => {
    const ocapiUrlSuffix = `/code_versions/${codeVersionId}`;

    try {
        // Create the base request definition
        const thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);
        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.get(thisRequestDef.url, thisRequestDef);
        resolve({
            status: responseObj.status,
            data: responseObj.data
        });
    } catch (e) {
        reject(e);
    }
});
