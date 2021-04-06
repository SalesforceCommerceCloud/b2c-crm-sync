'use strict';

// Initialize constants
const config = require('config');
const validate = require('validate.js');

/**
 * @function getScratchOrgForceOverwrite
 * @description Attempts to validate the if deployments should force-overwrite property
 *
 * @param {Boolean} forceOverwrite Represents the command-option specified via the CLI argument
 * @return {Boolean} Returns the valid value to leverage for the scratch-org default
 */
function getScratchOrgForceOverwrite(forceOverwrite) {

    // Initialize local variables
    let output;

    // Default the output property
    output = config.get('sfScratchOrg.forceOverwrite');

    // Maintain the specified default -- provided that its a boolean
    if (!validate.isBoolean(forceOverwrite)) { output = forceOverwrite; }

    // Force a boolean value
    output = (output === 'true');

    // Return the flag value
    return output;

}

// Export the function
module.exports = getScratchOrgForceOverwrite;
