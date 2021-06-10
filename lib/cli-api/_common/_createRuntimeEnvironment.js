'use strict';

// Initialize required modules
const config = require('config');

// Parse the CLI environment properties
require('dotenv').config();

/**
 * @typedef {Object} environmentDef
 * @description Represents an instance of the environment object used to specify
 * deployment properties
 *
 * @property {String} b2cHostName Describes the url of the target deployment environment.
 * @property {String} b2cInstanceName Shorthand descriptor for the b2c Instance Url.
 * @property {String} b2cClientId The clientId used to authenticate the deployment activity.
 * @property {String} b2cClientSecret The clientSecret used to authenticate the deployment activity.
 * @property {String} b2cUsername The B2C Username leveraged for the OOBO BM User Grant.
 * @property {String} b2cAccessKey The secret access key leveraged as a password for the OOBO BM User Grant.
 * @property {String} [b2cSiteIds] The B2C Commerce environment storefronts to deploy to
 * @property {String} [b2cCodeVersion] The code version being targeted for cartridge deployment.
 * @property {String} [b2cDataRelease] Identifies the connector-specific release being deployed.
 * @property {String} [sfCertDeveloperName] Represents the developerName of the self-signed Salesforce cert used for JWT.
 */

/**
 * @function _createRuntimeEnvironment
 * @description Helper function to build-out the runtime environment driven by the definition
 * of options via the local .env file (vs. the CLI-specified options)
 *
 * @param {Object} baseEnvironment Represents the baseline source for creating the environment
 * @return {Object} Returns an object containing a representation of the runtime environment
 */
module.exports = baseEnvironment => {
    // Initialize the output variables
    const output = {};
    // Initialize the cliOptions collection
    const cliOptions = config.util.toObject(config.get('cliOptions'));

    Object.keys(cliOptions).forEach(option => {
        // Was an baseline property defined for the current option identifier?
        if (baseEnvironment.hasOwnProperty(cliOptions[option].envProperty)) {
            // If so, copy this value to the runtime environment variable
            output[option] = baseEnvironment[cliOptions[option].envProperty];
        }
    });

    // Return the runtime environment variable
    return output;
};
