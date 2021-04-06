'use strict';

// Initialize local libraries
const validators = require('../../../lib/cli-api/validators');

/**
 * @function _getB2CConnProperties
 * @description Helper function to consolidate the validation of the B2C Commerce code version
 * into a commonly-referencable object
 *
 * @param {environmentDef} environmentDef Represents the environment definition being processed
 * @return {Object} Returns a roll-up object containing the validation results
 */
module.exports = environmentDef => {
    const output = {
        isValid: false,
        b2cCodeVersion: validators.validateB2CCodeVersion(environmentDef.b2cCodeVersion)
    };

    // Shorthand the validation result for simpler processing
    output.isValid = output.b2cCodeVersion.validationResult;

    return output;
};
