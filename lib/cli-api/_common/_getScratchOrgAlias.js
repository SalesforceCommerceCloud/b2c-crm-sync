'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const validators = require('./../validators');

/**
 * @function getScratchOrgAlias
 * @description Attempts to validate the alias formatting for a given scratchOrg
 *
 * @param {String} scratchOrgAlias Represents the command-option specified via the CLI argument
 * @return {String} Returns the valid value to leverage for the scratch-org alias
 */
function getScratchOrgAlias(scratchOrgAlias) {

    // Initialize local variables
    let output,
        validatorOutput;

    // Default the output property
    output = config.get('sfScratchOrg.defaultAlias');

    // Attempt to validate that string
    validatorOutput = validators.validateString(scratchOrgAlias);

    // Maintain the specified alias -- provided that it validates
    if (validatorOutput.validationResult === true) { output = scratchOrgAlias; }

    // Return the alias to leverage
    return output;

}

// Export the function
module.exports = getScratchOrgAlias;
