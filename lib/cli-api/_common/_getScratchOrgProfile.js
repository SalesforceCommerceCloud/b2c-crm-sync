'use strict';

// Initialize constants
const config = require('config');

/**
 * @function getScratchOrgProfile
 * @description Attempts to validate that the specified scratch-org profile falls within accepted values
 *
 * @param {String} scratchOrgProfile Represents the command-option specified via the CLI argument
 * @return {String} Returns the valid value for the scratch-org profile to leverage
 */
function getScratchOrgProfile(scratchOrgProfile) {

    // Initialize local variables
    let output;

    // Default the output property
    output = config.get('sfScratchOrg.defaultProfile');

    // Was the specified scratch-org profile found as one of the valid profiles
    if (config.get('sfScratchOrg.validProfiles').indexOf(scratchOrgProfile) !== -1) {

        // If so, then respect that value
        output = scratchOrgProfile;

    }

    // Return the release findings
    return output;

}

// Export the function
module.exports = getScratchOrgProfile;
