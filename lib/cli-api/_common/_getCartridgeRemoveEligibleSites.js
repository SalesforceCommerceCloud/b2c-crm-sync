'use strict';

// Initialize local libraries
const doesCartridgePathHaveCartridges = require('./_doesCartridgePathHaveCartridges');
const doesSiteMeetCartridgeRequirements = require('./_doesSiteMeetCartridgeRequirements');
const getCartridgeAddRemoveEligibleSites = require('./_getCartridgeAddRemoveEligibleSites');

/**
 * @function _getCartridgeRemoveEligibleSites
 * @description Helper function to evaluate sites and determine which are eligible for cartridge-removes
 * @param {Array} siteValidationSummary Represents the collection of validated storefronts
 * @return {Array} Returns an array of validated sites
 */
module.exports = siteValidationSummary => {
    let output;

    siteValidationSummary.forEach(siteSummary => {
        // Create a reference to the cartridge path for this site
        const cartridgePath = siteSummary.data.cartridges.split(':');
        // If so, evaluate if cartridges are already deployed
        const deployResults = doesCartridgePathHaveCartridges(cartridgePath, siteSummary, 'deploy');
        // Does this site satisfy all cartridge requirements?
        const isSiteDeployable = doesSiteMeetCartridgeRequirements(deployResults, false, 'errors.b2c.cartridgeDoesNotExistInSitePath');
        // Build-out the output array by evaluating if the site is deployable
        output = getCartridgeAddRemoveEligibleSites(output, isSiteDeployable, siteSummary);
    });

    // Return the collection of eligible sites
    return output;
};
