'use strict';

// Initialize constants
const config = require('config');

/**
 * @function _getCartridges
 * @description Helper function to retrieve the names and details of cartridges
 * for the b2c-crm-sync application
 *
 * @return {Array} Returns a collection of the cartridge names
 */
module.exports = () => {
    // Build-out the mashup-object of cartridge details
    return {
        cartridgePath: config.get('paths.source.b2c.cartridges').toString(),
        cartridges: config.get('b2c.cartridges.deploy')
    };
};
