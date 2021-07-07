'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfUserPasswordReset
 * @description Attempts to reset the password for the scratchOrg user
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise}
 */
module.exports = (environmentDef) => {

    // Initialize local variables
    let deployArguments;

    // Default the deployment arguments
    deployArguments = {
        _rejectOnError: true
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        deployArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to reset the user's password
    return sfdx.force.user.passwordGenerate(deployArguments);

};
