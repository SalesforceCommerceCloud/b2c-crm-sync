'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfUserPermsetAssign
 * @description Attempts to assign the default permission-set to the scratchOrg user
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} permissionSetName Represents the permissionSet name to be assigned to the current user
 * @returns {Promise}
 */
module.exports = (environmentDef, permissionSetName) => {

    // Initialize local variables
    let deployArguments;

    // Default the deployment arguments
    deployArguments = {
        permsetname: permissionSetName,
        _rejectOnError: true
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        deployArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to assign the permission-set to the user
    return sfdx.user.permsetAssign(deployArguments);

};
