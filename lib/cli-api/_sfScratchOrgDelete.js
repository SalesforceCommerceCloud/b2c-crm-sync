'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfScratchOrgDelete
 * @description Attempts to delete a given scratchOrg
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise}
 */
module.exports = (environmentDef) => {

    // noinspection SpellCheckingInspection
    const deployArguments = {
        _rejectOnError: true,
        noprompt: true
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        deployArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to delete to the scratchOrg
    return sfdx.org.delete(deployArguments);

};
