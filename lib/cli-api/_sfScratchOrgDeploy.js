'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfScratchOrgDeploy
 * @description Attempts to deploy b2c-crm-sync code a SFDX scratch org
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} deployPath Represents the path where the specified meta-data will be deployed to a scratchOrg
 * @returns {Promise}
 */
module.exports = (environmentDef, deployPath) => {

    // noinspection SpellCheckingInspection
    const deployArguments = {
        _rejectOnError: true,
        sourcepath: deployPath
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        deployArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to deploy to the scratchOrg
    return sfdx.source.deploy(deployArguments);

};
