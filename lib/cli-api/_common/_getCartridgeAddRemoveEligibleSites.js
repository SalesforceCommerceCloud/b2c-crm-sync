'use strict';

/**
 * @function _getCartridgeAddRemoveEligibleSites
 * @description Helper function used to build the eligibilityCollection contents
 *
 * @param {Object} eligibilityCollection Represents the on-going eligibility collection
 * @param {Object} isSiteDeployable Describes if the current site is deployable
 * @param {Object} siteSummary Provides a summary of th current site
 * @return {*} Returns the eligibility collection
 */
module.exports = (eligibilityCollection = {
    eligible: {
        siteIds: [],
        siteDetails: {}
    },
    inEligible: {
        siteIds: [],
        siteDetails: {}
    }
}, isSiteDeployable, siteSummary) => {
    // Is the current site deployable?
    if (isSiteDeployable.isValid === true) {
        // Add this site to the eligibility list
        eligibilityCollection.eligible.siteIds.push(siteSummary.siteId);
        eligibilityCollection.eligible.siteDetails[siteSummary.siteId] = siteSummary;
    } else {
        // If not, flag the site as inEligible
        eligibilityCollection.inEligible.siteIds.push(siteSummary.siteId);
        eligibilityCollection.inEligible.siteDetails[siteSummary.siteId] = siteSummary;
        eligibilityCollection.inEligible.siteDetails[siteSummary.siteId].errors = isSiteDeployable;

    }

    return eligibilityCollection;
};
