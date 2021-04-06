'use strict';

// Initialize local libraries
const validators = require('../../../lib/cli-api/validators');

/**
 * @function _getB2CConnProperties
 * @description Helper function to consolidate the validation of the B2C Connection properties
 * into a commonly-referencable object
 *
 * @param {environmentDef} environmentDef Represents the environment definition being processed
 * @return {Object} Returns a roll-up object containing the validation results
 */
module.exports = environmentDef => {
    const optionList = ['b2cClientId', 'b2cClientSecret', 'b2cHostName'];
    // Generate the validation results for all dependent attributes
    const output = {
        isValid: false,
        b2cClientId: validators.validateString(environmentDef.b2cClientId),
        b2cClientSecret: validators.validateString(environmentDef.b2cClientSecret),
        b2cHostName: validators.validateHostName(environmentDef.b2cHostName)
    };

    // Verify that the B2C Commerce connection properties have all passed validation
    output.isValid = validators.verifyPropertyCollection(optionList, output);

    return output;
};