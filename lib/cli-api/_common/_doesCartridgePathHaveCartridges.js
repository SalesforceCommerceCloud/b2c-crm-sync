'use strict';

// Initialize constants
const config = require('config');

/**
 * @function _doesCartridgePathHaveCartridges
 * @description Helper function to evaluate if a cartridge-path has the b2c-crm-sync cartridges
 * or their pre-requisites present in it's cartridge path (returns true if yes, false if no)
 *
 * @param {Array} cartridgePath Represents the cartridge path for the site being evaluated
 * @param {Object} site Represents the B2C Commerce site being evaluated
 * @param {String} cartridgeKey Represents the key used to retrieve cartridges to evaluate
 * @returns {Array} Returns an array containing the cartridge results for the specified storefront
 */
module.exports = (cartridgePath, site, cartridgeKey) => config.get(`b2c.cartridges.${cartridgeKey}`).map(cartridge => {
    return {
        isValid: false,
        hasCartridge: cartridgePath.indexOf(cartridge.name) > -1,
        siteId: site.siteId,
        cartridge: cartridge,
        siteDetails: site
    };
});
