'use strict';

// Initialize constants
const config = require('config');
const dotenv = require('dotenv');

/**
 * @function _seedProcessEnv
 * @description Helper function used to seed an environment configuration
 * within the unit-test scope (used to create environment definitions for unit tests)
 *
 * @param {String} configEnvironmentDef Represents the config-property containing the environment definition
 */
function _seedProcessEnv(configEnvironmentDef) {

    // Initialize local variables
    let buf,
        envConfig;

    // Seed the default configuration if one isn't provided
    if (configEnvironmentDef === undefined) { 'unitTests.dotEnvironments.default'; }

    // Create the buffer containing the environment definition to use
    buf = Buffer.from(config.get(configEnvironmentDef).join(''));

    // Parse the environment definition
    envConfig = dotenv.parse(buf);

    // Loop over the collection of parsed configuration properties
    for (let configProperty in envConfig) {

        // Seed the configuration properties in the process scope
        // noinspection JSUnfilteredForInLoop
        process.env[configProperty] = envConfig[configProperty];

    }

}

module.exports = _seedProcessEnv;
