'use strict';

// Initialize local libraries
const getCartridgeAddRemoveEligibleSites = require('./_getCartridgeAddRemoveEligibleSites');
const doesCartridgePathHaveCartridges = require('./_doesCartridgePathHaveCartridges');
const doesSiteMeetCartridgeRequirements = require('./_doesSiteMeetCartridgeRequirements');

/**
 * @function _getCartridgeAddEligibleSites
 * @description Helper function to evaluate sites and determine which are eligible for cartridge-adds
 * @param {Array} siteValidationSummary Represents the collection of validated storefronts
 * @return {Array} Returns an array of validated sites
 */
module.exports = siteValidationSummary => {
    let output;

    siteValidationSummary.forEach(siteSummary => {
        // Create a reference to the cartridge path for this site
        const cartridgePath = siteSummary.data.cartridges.split(':');
        // Determine the eligibility results of a site vs existing requirements
        const requireResults = doesCartridgePathHaveCartridges(cartridgePath, siteSummary, 'require');
        // Does this site satisfy all cartridge requirements?
        const doesSiteMeetRequirements = doesSiteMeetCartridgeRequirements(requireResults);

        // Does the current site meet core requirements?
        if (doesSiteMeetRequirements.isValid === true) {
            // If so, evaluate if cartridges are already deployed
            const deployResults = doesCartridgePathHaveCartridges(cartridgePath, siteSummary, 'deploy');
            // Does this site satisfy all cartridge requirements?
            const isSiteDeployable = doesSiteMeetCartridgeRequirements(deployResults, true, 'errors.b2c.cartridgeExistsInSitePath');
            // Build-out the output array by evaluating if the site is deployable
            output = getCartridgeAddRemoveEligibleSites(output, isSiteDeployable, siteSummary);
        } else {
            // If not, flag the site as inEligible
            output.inEligible.siteIds.push(siteSummary.siteId);
            output.inEligible.siteDetails[siteSummary.siteId] = siteSummary;
            output.inEligible.siteDetails[siteSummary.siteId].errors = doesSiteMeetRequirements;

        }
    });

    return output;

};
