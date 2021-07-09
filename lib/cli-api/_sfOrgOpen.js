'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfScratchOrgOpen
 * @description Attempts to open the specified scratchOrg
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the result of the SF org-open request
 */
module.exports = environmentDef => {
    const openArguments = {
        _rejectOnError: true
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        openArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to open to the scratchOrg
    return sfdx.force.org.open(openArguments)
        .then(result => {
            return {
                outputDisplay: {
                    orgId: result.orgId,
                    username: result.username
                },
                result
            };
        });
};
