'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const validators = require('../../lib/cli-api/validators');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const ciSitesAPI = require('../../lib/apis/ci/sites');

/**
 * @typedef {Object} siteDetails
 * @description Represents a object describing a subset of the B2C Commerce Data API site properties
 *
 * @property {String} cartridges Describes the contents of the cartridge path
 * @property {String} display_name Describes the customer-facing name for the storefront
 * @property {String} storefront_status Describes the display-status of the storefront
 * @property {Object} customer_list_link Object describing the customer list to which a site is associated
 * @property {String} customer_list_link.customer_list_id Describes the primary key of the associated customer list
 */

/**
 * @private
 * @function _createValidationSummary
 * @description Helper function to roll-up the site / storefront details retrieved into
 * a simple object to consume.  Abstracts the verbose results into a more consumable format.
 *
 * @param {Object} siteResults Represents the verbose site detail results
 * @return {*} Returns an array representing the collection of sites that were validated
 */
function _createValidationSummary(siteResults) {

    // Initialize the output variable
    const summaries = {
        success: [],
        error: []
    };

    Object.keys(siteResults).forEach(siteKey => {
        const siteSummary = siteResults[siteKey];
        const siteDetails = siteSummary.siteDetails;

        // were the siteDetails summary found?
        if (siteSummary.isValid === true) {
            // Add the key / value pair to the summary variable
            summaries.success.push({
                siteId: siteKey,
                url: siteDetails.url,
                version: config.get('b2c.ocapiVersion'),
                status: siteDetails.status,
                statusText: siteDetails.data.storefront_status,
                data: {
                    cartridges: siteDetails.data.cartridges,
                    displayName: siteDetails.data.display_name,
                    customerList: siteDetails.data.customer_list_link.customer_list_id
                },
                outputDisplay: [
                    siteKey,
                    siteDetails.status,
                    siteDetails.data.storefront_status,
                    siteDetails.url
                ]
            });
            return;
        }

        // Add the key / value pair to the summary variable
        summaries.error.push({
            siteId: siteKey,
            url: siteDetails?.url,
            version: config.get('b2c.ocapiVersion'),
            status: siteDetails?.status,
            statusText: 'invalid',
            data: siteDetails?.data,
            outputDisplay: [
                siteKey,
                siteSummary.error
            ]
        });
    });

    return summaries;
}

/**
 * @function _b2cSitesVerify
 * @description Attempts to validate that the specified B2C Commerce storefront sites
 * are valid, well-formed, and available via the B2C Commerce instance specified
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            verifySites: {}
        },
        siteResults: {},
        outputDisplay: {
            authenticate: {},
            verifySites: {}
        }
    };
    const b2cSiteProperties = validators.validateB2CSiteIDs(environmentDef.b2cSiteIds);
    let invalidSiteCount = 0;

    // Authenticate first
    try {
        // Audit the authorization token for future rest requests
        output.apiCalls.authenticate.authToken = await b2cAuthenticate(environmentDef);
        output.outputDisplay.authenticate = output.apiCalls.authenticate;
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);
        return;
    }

    for (let siteId of b2cSiteProperties.value) {
        try {
            // Connect with the B2C Commerce instance and attempt to retrieve the details for the current storefront
            const siteDetailResults = await ciSitesAPI.getDetail(environmentDef, output.apiCalls.authenticate.authToken, siteId);

            // Initialize the object used to track service results
            output.apiCalls.verifySites[siteId] = {
                isValid: siteDetailResults.hasOwnProperty('status') && siteDetailResults.status === 200,
                siteDetails: siteDetailResults
            };
        } catch (e) {
            output.apiCalls.verifySites[siteId] = {
                isValid: false,
                error: e,
                siteDetails: undefined
            };
        } finally {
            // Increment the invalid site-count -- if the site is invalid
            if (output.apiCalls.verifySites[siteId].isValid === false) {
                invalidSiteCount += 1;
            }
        }
    }

    // Build a validation summary and attach that to the top-level object
    output.siteResults = _createValidationSummary(output.apiCalls.verifySites);
    output.outputDisplay.verifySites.success = output.siteResults.success.map(siteData => siteData.outputDisplay);
    output.outputDisplay.verifySites.error = output.siteResults.error.map(siteData => siteData.outputDisplay);

    // If all the sites are invalid -- then throw an exception
    if (invalidSiteCount === b2cSiteProperties.value.length) {
        reject('All sites failed validation; please check your environment definition');
        return;
    }

    // Invoke the callback and continue processing
    resolve(output);
});
