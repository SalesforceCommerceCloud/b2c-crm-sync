'use strict';

/**
 * @function _getVerifiedSites
 * @description Helper function to only pull validated sites from the validation summary
 * @param {Array} siteValidationSummary Represents the collection of validated storefronts
 * @return {Array} Returns an array of validated sites
 */
module.exports = siteValidationSummary => siteValidationSummary.filter(siteSummary => siteSummary.status === 200);
