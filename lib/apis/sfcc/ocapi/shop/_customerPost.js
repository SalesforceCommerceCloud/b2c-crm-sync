'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _customerPost
 * @description Attempts to register a B2C Commerce Customer Profile
 *
 * @param {Object} envDef Represents the environment where a given code-version will be activated
 * @param {String} siteId Represents the site being authed-against for the guest shopping session
 * @param {String} clientId Represents the clientId used to identify the request
 * @param {String} [guestAuthToken] Represents the authToken to use for the registration event *
 * @param {Object} [customerProfile] Represents the customerProfile to process via registration
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (envDef, siteId, clientId, guestAuthToken, customerProfile) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        const ocapiUrlSuffix = '/customers';

        try {

            // Initialize the request instance and definition
            const b2cRequestInstance = requestLib.createRequestInstance(envDef);
            let thisRequestDef = requestLib.createOCAPIShopRequestDef(
                ocapiUrlSuffix, siteId, clientId, guestAuthToken);

            // Define the request body details
            thisRequestDef.body = customerProfile;

            // Execute and process the request; wait for the results
            const responseObj = await b2cRequestInstance.post(
                thisRequestDef.url, thisRequestDef.body, thisRequestDef);

            // Initialize the output property
            let output = {
                success: true,
                headers: responseObj.headers,
                status: responseObj.status,
                data: responseObj.data
            };

            // If the authToken is present -- then shorthand it
            if (Object.prototype.hasOwnProperty.call(responseObj.headers, 'authorization')) {

                // If so, then append it to the output
                output.authToken = output.headers.authorization.split(' ').pop();

            }

            // Process the results
            resolve(output);

        } catch (e) {

            // Indicate an error occurred
            e.success = false;

            // Otherwise -- throw an error
            reject(e);

        }

});
