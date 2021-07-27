// noinspection JSUnfilteredForInLoop

'use strict';

// Initialize constants
const config = require('config'),
    dotenv = require('dotenv');

/**
 * @function seedProcessEnv
 * @description Helper function used to seed an environment configuration
 * within the unit-test scope (used to create environment definitions for unit tests)
 *
 * @param {String} configEnvironmentDef Represents the config-property containing the environment definition
 * @returns {undefined}
 */
function seedProcessEnv(configEnvironmentDef) {

    // Initialize local variables
    let buf,
        envConfig;

    // Seed the default configuration if one isn't provided
    // eslint-disable-next-line no-param-reassign
    if (configEnvironmentDef === undefined) { configEnvironmentDef =
        config.util.toObject(config.get('unitTests.dotEnvironments.default')); }

    // Create the buffer containing the environment definition to use
    buf = Buffer.from(config.get(configEnvironmentDef).join(''));

    // Parse the environment definition
    envConfig = dotenv.parse(buf);

    // Loop over the collection of parsed configuration properties
    // eslint-disable-next-line guard-for-in
    for (let configProperty in envConfig) {

        // Seed the configuration properties in the process scope
        // eslint-disable-next-line no-process-env
        process.env[configProperty] = envConfig[configProperty];

    }

    // Complete successfully
    return true;

}

module.exports = seedProcessEnv;
