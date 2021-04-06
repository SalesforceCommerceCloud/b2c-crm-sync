'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _customerSearchByEmail
 * @description Searches for a given customerProfile by CustomerList / Email Address
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} customerListId Describes the customerList used to scope the search
 * @param {String} emailAddress Describes the emailAddress used to scope the search
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, customerListId, emailAddress) => new Promise(async (resolve, reject) => {

    // Initialize the baseUrl for this request
    const ocapiUrlSuffix = `/customer_lists/${customerListId}/customer_search`;

    // Initialize local variables
    let output,
        thisRequestDef;

    try {

        // Create the base request definition
        thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);

        // Initialize the request-body to leverage
        thisRequestDef.body = {
            "query" :
                {
                    "term_query": {
                        "fields": ["email"],
                        "operator": "is",
                        "values":[emailAddress]
                    }
                }
        }

        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.post(thisRequestDef.url, thisRequestDef.body, thisRequestDef);

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
