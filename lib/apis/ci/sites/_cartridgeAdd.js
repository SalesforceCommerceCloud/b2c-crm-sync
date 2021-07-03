'use strict';

// Initialize any required modules
const config = require('config');

// Initialize any helper libraries
const requestLib = require('../../../../lib/_common/request');

// Initialize the OCAPI data call to add a cartridge to a site
const siteCartridgeAdd = require('../../sfcc/ocapi/data/_siteCartridgePost');

/**
 * @function _siteCartridgeAdd
 * @description Add a cartridge from a B2C Commerce site
 *
 * @param {Object} environmentDef Represents the environment where a given code-version will be created
 * @param {String} token Represents the authentication token for the given environment
 * @param {String} siteId Represents the B2C Commerce site identifier to retrieve
 * @param {Object} cartridge Describes the cartridge being added to the storefront cartridge path
 * @returns {Promise} Returns the results of the cartridge-add a given site's cartridgePath
 */
module.exports = (environmentDef, token, siteId, cartridge) => new Promise(async (resolve, reject) => {
    const b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

    try {
        // Leverage the B2C Commerce OCAPI Data API to add a cartridge to the site's cartridge path
        const siteDetails = await siteCartridgeAdd(b2cRequestInstance, token, siteId, cartridge.postBody);
        // Evaluate if the status property is present -- and throw an error if we're not successful
        if (!Object.prototype.hasOwnProperty.call(siteDetails, 'status') || siteDetails.status !== 200) {
            // Execute the callback and pass-through the error
            reject(config.get('errors.b2c.unableToAddSiteCartridge'));
            return;
        }

        // Otherwise, assume success and continue
        resolve(siteDetails);
    } catch (e) {
        reject(config.get('errors.b2c.unableToAddSiteCartridge'));
    }

});
