'use strict';

// Initialize constants
const config = require('config');
const axios = require('axios');

/**
 * @function _postB2CInstanceSetup
 * @description Executes the b2cInstanceSetup flow REST API
 *
 * @param {Object} environmentDef Represents the environment definition used to perform the request
 * @param {Connection} authToken Represents SFDC authToken to leverage via the REST API call
 * @returns {Promise} Returns a promise that contains the processing results
 */
module.exports = (environmentDef, authToken) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        requestUrl,
        apiVersion,
        requestConfig;

    // Retrieve the API Version to leverage
    apiVersion = config.get('unitTests.testData.sfdcAPIVersion');

    // Initialize the requestUrl to be performed
    requestUrl = `https://${environmentDef.sfHostName}/services/data/${apiVersion}/actions/custom/flow/B2CInstanceSetup`;

    // Add-in the headers expected by the request
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        Authorization: `Bearer ${authToken}`
    };

    // Initialize the request
    requestConfig = {
        headers: headers
    };

    try {

        // Initialize and execute the request
        output = await axios.post(requestUrl, {
            inputs: [
                {
                    instanceName: environmentDef.b2cInstanceName
                }
            ]
        }
        , requestConfig);

        // Flag that the request was successful
        output.success = true;

        // Resolve the result
        resolve(output);

    } catch (e) {

        // Tag the success flag
        e.success = false;

        // Otherwise, reject the error
        reject(e);

    }

});
