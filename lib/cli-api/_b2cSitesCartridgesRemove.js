'use strict';

// Initialize constants
const config = require('config');

// Include B2C Commerce API functions
const b2cSitesVerify = require('./_b2cSitesVerify');

// Include the helper library to retrieve the environment details
const ciSitesAPI = require('../../lib/apis/ci/sites');
const common = require('../../lib/cli-api/_common');

/**
 * @function _b2cCodeCartridgePathRemove
 * @description Attempts to remove the app-cartridge paths from the sites that are
 * configured; eliminates site-specific access to app-cartridges
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use
 * @returns {Promise} Returns the site validationSummary
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {

    // Retrieve the collection of cartridges to deploy
    const cartridgeList = config.util.toObject(config.get('b2c.cartridges.deploy'));
    let output = {};

    // First, let's attempt to verify the B2C Commerce sites
    try {
        // Capture and cache the siteResults as our new output object
        output = await b2cSitesVerify(environmentDef);
    } catch (e) {
        reject(e);
        return;
    }

    // For verified sites, verify they have the app_storefront_base cartridge exists
    // Also, do these cartridge paths already have the app-cartridges in place
    output.eligibilityResults = common.getCartridgeRemoveEligibleSites(output.siteResults.success);

    if (output.eligibilityResults.eligible.siteIds.length === 0) {
        resolve(output);
        return;
    }

    output.apiCalls.cartridgeRemove = [];

    for (let siteId of output.eligibilityResults.eligible.siteIds) {
        const b2cSite = output.eligibilityResults.eligible.siteDetails[siteId];

        for (let cartridge of cartridgeList) {
            try {

                // Otherwise, attempt to remove the cartridge from the site's path
                const cartridgeRemoveResults = await ciSitesAPI.cartridgeRemove(
                    environmentDef,
                    output.apiCalls.authenticate.authToken,
                    siteId,
                    cartridge);

                // Add the cartridge to the removal results
                output.apiCalls.cartridgeRemove.push({
                    isValid: cartridgeRemoveResults.hasOwnProperty('status') && cartridgeRemoveResults.status === 200,
                    siteId: b2cSite.siteId,
                    siteDetails: b2cSite,
                    cartridgeId: cartridge,
                    errorObj: undefined,
                    processResults: cartridgeRemoveResults
                });

            } catch (e) {

                // Add the cartridge-exception to the removal results
                output.apiCalls.cartridgeRemove.push({
                    isValid: false,
                    siteId: b2cSite.siteId,
                    siteDetails: b2cSite,
                    cartridgeId: cartridge,
                    errorObj: e,
                    processResults: undefined
                });

            }
        }
    }

    resolve(output);

});
