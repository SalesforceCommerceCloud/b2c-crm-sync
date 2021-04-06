'use strict';

// Initialize local libraries
const validators = require('../../../lib/cli-api/validators');

/**
 * @function _getSFUserCredConnProperties
 * @description Helper function to consolidate the validation of the SF User Credential Connection properties
 * into a commonly-referencable object
 *
 * @param {environmentDef} environmentDef Represents the environment definition being processed
 * @return {Object} Returns a roll-up object containing the validation results
 */
module.exports = environmentDef => {
    const optionList = ['sfLoginUrl', 'sfUsername', 'sfPassword', 'sfSecurityToken'];
    // Generate the validation results for all dependent attributes
    const output = {
        isValid: false,
        sfLoginUrl: validators.validateHostName(environmentDef.sfLoginUrl),
        sfUsername: validators.validateString(environmentDef.sfUsername),
        sfPassword: validators.validateString(environmentDef.sfPassword),
        sfSecurityToken: validators.validateString(environmentDef.sfSecurityToken)
    };

    // Verify that the B2C Commerce connection properties have all passed validation
    output.isValid = validators.verifyPropertyCollection(optionList, output);

    return output;
};
