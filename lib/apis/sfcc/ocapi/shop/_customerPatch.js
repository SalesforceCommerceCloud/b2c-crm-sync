'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _customerPatch
 * @description Attempts to update a B2C Commerce Customer Profile
 *
 * @param {Object} envDef Represents the environment where a given code-version will be activated
 * @param {String} siteId Represents the site being authed-against for the guest shopping session
 * @param {String} clientId Represents the clientId used to identify the request
 * @param {String} customerAuthToken Represents the authToken to use for the registration event
 * @param {String} customerId Represents the customer who's profile is being updated
 * @param {Object} [profileUpdate] Represents the customerProfile to update and what changes should be applied
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (envDef, siteId, clientId, customerAuthToken, customerId, profileUpdate) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        const ocapiUrlSuffix = `/customers/${customerId}`;

        try {

            // Initialize the request instance and definition
            const b2cRequestInstance = requestLib.createRequestInstance(envDef);
            let thisRequestDef = requestLib.createOCAPIShopRequestDef(
                ocapiUrlSuffix, siteId, clientId, customerAuthToken);

            // Define the request body details
            thisRequestDef.body = profileUpdate;

            // Execute and process the request; wait for the results
            const responseObj = await b2cRequestInstance.patch(
                thisRequestDef.url, thisRequestDef.body, thisRequestDef);

            // Initialize the output property
            let output = {
                success: true,
                headers: responseObj.headers,
                status: responseObj.status,
                data: responseObj.data
            };

            // Process the results
            resolve(output);

        } catch (e) {

            // Indicate an error occurred
            e.success = false;

            // Otherwise -- throw an error
            reject(e);

        }

    });
