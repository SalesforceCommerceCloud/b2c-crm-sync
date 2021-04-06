'use strict';

// Initialize module dependencies
const config = require('config');

/**
 * @typedef {Object} optionDefinition
 * @description Represents an internal definition of a CLI option.
 *
 * @property {String} type Describes the cloud to which each optionDefinition belongs to
 * @property {Boolean} required Describes if this option is required for the domain.
 * @property {String} cli Describes the CLI command portion for this option.
 * @property {String} description Describes the purpose of the option.
 * @property {String} defaultType Describes the type of default that exists for an option definition.
 * @property {String} envProperty Describes the process.env property representing the option default.
 * @property {String} configProperty Describes the configuration property representing the option default.
 */

/**
 * @function _getProgramOptionDefault
 * @description Helper function to determine the default for a given program option value.  Supports leveraging
 * environment values or configuration properties for defaults based on the option configuration
 *
 * @param {String} programOptionKey Describes the identifier for a given programOption
 * @return {*} Returns the option value based on how it was calculated
 */
module.exports = programOptionKey => {
    /** @type {optionDefinition} -- Retrieve the option definition for the given program option key */
    const thisOptionDef = config.get('cliOptions').get(programOptionKey);

    // Is this option managed by the .env file?
    if (thisOptionDef.defaultType === 'env' && process.env.hasOwnProperty(thisOptionDef.envProperty)) {
        // If so, then pull the defaultType from the process.env
        return process.env[thisOptionDef.envProperty];
    // Otherwise, check if this option exists as a configuration property
    } else if (config.has(thisOptionDef.configProperty)) {
        // Otherwise, pull the defaultType from the config
        return config.get(thisOptionDef.configProperty);
    }
};
