'use strict';

// Initialize constants
const config = require('config');
const validate = require('validate.js');

/**
 * @function getScratchOrgSetDefault
 * @description Attempts to validate whether a scratch-org should be set as the default
 *
 * @param {Boolean} setDefault Represents the command-option specified via the CLI argument
 * @return {Boolean} Returns the valid value to leverage for the scratch-org default
 */
function getScratchOrgSetDefault(setDefault) {

    // Initialize local variables
    let output;

    // Default the output property
    output = config.get('sfScratchOrg.setDefault');

    // Maintain the specified default -- provided that its a boolean
    if (!validate.isBoolean(setDefault)) { output = setDefault; }

    // Force a boolean value
    output = (output === 'true');

    // Return the flag value
    return output;

}

// Export the function
module.exports = getScratchOrgSetDefault;
