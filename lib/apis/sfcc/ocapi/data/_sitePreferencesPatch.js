'use strict';

// Initialize local libraries
const requestLib = require('../../../../../lib/_common/request');

/**
 * @function _siteDetailsGet
 * @description Retrieves the details for a given storefront from the OCAPI Data API
 *
 * @param {Object} requestInstance Represents the base request-instance to leverage
 * @param {String} accessToken Describes the access-token containing API authentication
 * @param {String} siteId Describes the identifier for the site being retrieved
 * @param {String} preferenceGroup Describes the site preference group being retrieved
 * @param {Object} preferenceUpdate Represents the site preference update to be applied to the specified group
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (requestInstance, accessToken, siteId, preferenceGroup, preferenceUpdate) => new Promise(async (resolve, reject) => {

    // Define the url used to retrieve the site preferences
    const ocapiUrlSuffix = `/sites/${siteId}/site_preferences/preference_groups/${preferenceGroup}/Sandbox`;

    try {

        // Initialize local variables
        let output;

        // Create the base request definition
        const thisRequestDef = requestLib.createOCAPIDataRequestDef(ocapiUrlSuffix, accessToken);

        // Seed the preference update
        thisRequestDef.body = preferenceUpdate;

        // Execute and process the request; wait for the results
        const responseObj = await requestInstance.patch(thisRequestDef.url, thisRequestDef.body, thisRequestDef);

        // Capture the output variable
        output = {
            success: true,
            status: responseObj.status,
            data: responseObj.data
        };

        // Build out the output object
        resolve(output);

    } catch (e) {

        // Flag the error
        e.success = false;

        // Handle the error
        reject(e);

    }

});
