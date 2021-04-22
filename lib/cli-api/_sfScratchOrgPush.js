'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfScratchOrgPush
 * @description Attempts to deploy b2c-crm-sync code a SFDX scratch org
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => {
    const deployArguments = {
        forceoverwrite: environmentDef.sfScratchOrgForceOverwrite,
        _rejectOnError: true
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        deployArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to deploy to the scratchOrg
    return sfdx.source.push(deployArguments);
};
