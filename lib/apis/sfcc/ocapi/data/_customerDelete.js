'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _customerDelete
 * @description Deletes a given customer using their customerList / customerNo combination
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} customerListId Describes the customerList used to scope the delete
 * @param {String} customerNo Describes the customerNumber used to scope the delete
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, customerListId, customerNo) => new Promise(async (resolve, reject) => {

    // Initialize the baseUrl for this request
    const ocapiUrlSuffix = `/customer_lists/${customerListId}/customers/${customerNo}`;

    // Initialize local variables
    let output,
        thisRequestDef;

    try {

        // Create the base request definition
        thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);

        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.delete(thisRequestDef.url, thisRequestDef);

        // Audit the results
        output = {
            success: true,
            status: responseObj.status,
            data: responseObj.data
        };

        // Resolve successfully
        resolve(output);

    } catch (e) {

        // Indicate an error occurred
        e.success = false;

        // Indicate an error occurred
        reject(e);

    }

});
