'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const validators = require('./../validators');

/**
 * @function getScratchOrgDurationDays
 * @description Attempts to validate the duration days for a given scratchOrg
 *
 * @param {String} scratchOrgDurationDays Represents the command-option specified via the CLI argument
 * @return {String} Returns the valid value to leverage for the scratch-org duration days
 */
function getScratchOrgDurationDays(scratchOrgDurationDays) {

    // Initialize local variables
    let output,
        validatorOutput;

    // Default the output property
    output = config.get('sfScratchOrg.durationDays');

    // validate that duration days is between 7-30
    validatorOutput = validators.validateDurationDays(scratchOrgDurationDays);

    // Maintain the specified duration days value -- provided that it validates
    if (validatorOutput.validationResult === true) { output = scratchOrgDurationDays; }

    // Return the alias to leverage
    return output;

}

// Export the function
module.exports = getScratchOrgDurationDays;
