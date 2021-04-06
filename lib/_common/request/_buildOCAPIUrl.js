'use strict';

/**
 * @function buildOCAPIUrl
 * @description Builds the OCAPI Url used to drive a request
 *
 * @param {String} apiType Describes the type of API for the request
 * @param {String} apiVersion Represents the API version to include in the OCAPI url
 * @param {String} urlSuffix Represents any suffix being added to the url
 * @param {Boolean} [includeBMSite] Should the BM site representation be included in the url
 * @param {String} [siteId] Describes the internal siteId used to identify the site
 * @returns {Object} Returns the OCAPI Url created using the argument properties
 */
module.exports = (apiType, apiVersion, urlSuffix, includeBMSite, siteId) => {

    // Initialize local variables
    let output;

    switch (apiType) {
    // Create foundation urls for the data api
    case 'data':
        // Do we need to include the BM Site?
        if (includeBMSite === true) {
            // If so, include it
            output = '/s/-';
        }
        break;
    // Create foundation urls for the shop api
    case 'shop':
        // If it's a shop request -- include the siteId
        output = `/s/${siteId}`;
        break;
    default:
        throw new Error(`Unknown api type "${apiType}"`);
    }

    // Continue to build out the OCAPI url -- including the API version and urlSuffix
    return `${output}/dw/${apiType}/${apiVersion}${urlSuffix}`;
};
