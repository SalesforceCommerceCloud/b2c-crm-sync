// noinspection FunctionWithMultipleLoopsJS

'use strict';

// Initialize constants
const config = require('config');

// Include B2C Commerce API functions
const b2cSitesVerify = require('./_b2cSitesVerify');

// Include the helper library to retrieve the environment details
const ciSitesAPI = require('../../lib/apis/ci/sites');
const common = require('../../lib/cli-api/_common');

/**
 * @function _b2cSitesCartridgesAdd
 * @description Attempts to add the app-cartridge paths to the sites that are
 * configured; creates site-specific access to app-cartridges
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the results of the cartridge add attempt
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
    output.eligibilityResults = common.getCartridgeAddEligibleSites(output.siteResults.success);

    if (output.eligibilityResults.eligible.siteIds.length === 0) {
        resolve(output);
        return;
    }

    output.apiCalls.cartridgeAdd = [];

    for (let siteId of output.eligibilityResults.eligible.siteIds) {
        const b2cSite = output.eligibilityResults.eligible.siteDetails[siteId];

        for (let cartridge of cartridgeList) {
            try {
                // Otherwise, attempt to remove the cartridge from the site's path
                const cartridgeAddResults = await ciSitesAPI.cartridgeAdd(
                    environmentDef,
                    output.apiCalls.authenticate.authToken,
                    siteId,
                    cartridge
                );
                output.apiCalls.cartridgeAdd.push({
                    isValid: cartridgeAddResults.hasOwnProperty('status') && cartridgeAddResults.status === 200,
                    siteId: b2cSite.siteId,
                    siteDetails: b2cSite,
                    cartridgeId: cartridge,
                    errorObj: undefined,
                    processResults: cartridgeAddResults
                });
            } catch (e) {
                output.apiCalls.cartridgeAdd.push({
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
