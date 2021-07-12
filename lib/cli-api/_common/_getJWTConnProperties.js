'use strict';

// Initialize local libraries
const validators = require('../../../lib/cli-api/validators');

/**
 * @function _getJWTConnProperties
 * @description Helper function to consolidate the validation of the Account Manager
 * JWT-based connection properties into a commonly-referencable object
 *
 * @param {environmentDef} environmentDef Represents the environment definition being processed
 * @return {Object} Returns a roll-up object containing the validation results
 */
module.exports = environmentDef => {

    // Initialize the list of attributes to process
    const optionList = ['b2cClientId', 'sfCertDeveloperName'];

    // Generate the validation results for all dependent attributes
    const output = {
        isValid: false,
        b2cClientId: validators.validateString(environmentDef.b2cClientId),
        sfCertDeveloperName: validators.validateString(environmentDef.sfCertDeveloperName)
    };

    // Verify that the B2C Commerce connection properties have all passed validation
    output.isValid = validators.verifyPropertyCollection(optionList, output);

    // Return the output
    return output;

};
