'use strict';

// Initialize any required modules
const config = require('config');

// Initialize any helper libraries
const requestLib = require('../../../../lib/_common/request');

// Initialize the OCAPI data call to retrieve a site detail
const siteDetailsGet = require('../../../../lib/apis/sfcc/ocapi/data/_siteDetailsGet');

/**
 * @function _getSiteDetail
 * @description Retrieve a site's details from a given environment definition
 *
 *
 * @param {Object} environmentDef Represents the environment where a given code-version will be created
 * @param {String} token Represents the authentication token for the given environment
 * @param {String} siteId Represents the B2C Commerce site identifier to retrieve
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, token, siteId) => new Promise(async (resolve, reject) => {
    const b2cRequestInstance = requestLib.createRequestInstance(environmentDef);
    try {
        // Leverage the B2C Commerce OCAPI Data API to remove a cartridge from the site's cartridge path
        const siteDetails = await siteDetailsGet(b2cRequestInstance, token, siteId);

        // Evaluate if the status property is present -- and throw an error if we're not successful
        if (!siteDetails.hasOwnProperty('status') || siteDetails.status !== 200) {
            reject(config.get('errors.b2c.unableToRetrieveSite'));
            return;
        }

        // Otherwise, assume success and continue
        resolve(siteDetails);
    } catch (e) {
        reject(config.get('errors.b2c.unableToRetrieveSite'));
    }
});
