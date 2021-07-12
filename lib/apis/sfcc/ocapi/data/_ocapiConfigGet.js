'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _customerGet
 * @description Attempts to retrieve the details of a B2C Commerce Customer Profile
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {Object} environmentDef Represents the current environment configuration
 * @param {String} accessToken Describes the access-token containing API authentication
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, environmentDef, accessToken) => new Promise(async (resolve, reject) => {

    // Initialize the baseUrl for this request
    const ocapiUrlSuffix = `/ocapi_configs/${environmentDef.b2cClientId}`;

    // Initialize local variables
    let output,
        thisRequestDef;

    try {

        // Create the base request definition
        thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);

        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.get(thisRequestDef.url, thisRequestDef);

        // Was the request successful?
        if (responseObj.status === 200) {

            // Audit the results
            output = {
                success: true,
                status: responseObj.status,
                global: responseObj.data.global
            };

            // Check if the site-data is attached to the response; if so -- add it to the output
            if (Object.prototype.hasOwnProperty.call(responseObj.data, 'sites')) {
                output.sites = responseObj.data.sites;
            }

        } else {

            // Audit the results
            output = {
                success: false,
                status: responseObj.status,
                data: responseObj.data
            };

        }

        // Resolve successfully
        resolve(output);

    } catch (e) {

        // Indicate an error occurred
        e.success = false;

        // Indicate an error occurred
        reject(e);

    }

});
