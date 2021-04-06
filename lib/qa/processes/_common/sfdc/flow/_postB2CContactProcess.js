'use strict';

// Initialize constants
const config = require('config');
const axios = require('axios');

/**
 * @function _postB2CContactProcess
 * @description Executes the contactProcess flow REST API
 *
 * @param {Object} environmentDef Represents the environment definition used to perform the request
 * @param {String} authToken Represents SFDC authToken to leverage via the REST API call
 * @param {Object} processBody Represents the body of the contactProcess request
 * @returns {Promise} Returns a promise that contains the processing results
 */
module.exports = (environmentDef, authToken, processBody) => new Promise( async (resolve, reject) => {

    // Initialize local variables
    let output,
        requestUrl,
        apiVersion,
        requestConfig;

    // Retrieve the API Version to leverage
    apiVersion = config.get('unitTests.testData.sfdcAPIVersion');

    // Initialize the requestUrl to be performed
    requestUrl = `https://${environmentDef.sfHostName}/services/data/${apiVersion}/actions/custom/flow/B2CContactProcess`;

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
        output = await axios.post(requestUrl, processBody, requestConfig);

        // Flag that the request was successful
        output.success = true;

        // Resolve the result
        resolve(output);

    } catch (e) {

        // Tag the success flag
        e.success = false;

        console.log(e.response.data);

        // Otherwise, reject the error
        reject(e);

    }

});
