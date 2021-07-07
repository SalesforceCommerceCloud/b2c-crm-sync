'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfUserDisplay
 * @description Attempts to retrieve the details for a given scratchOrg user
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the userDetails obtained from the Salesforce environment
 */
module.exports = environmentDef => {
    const displayArguments = {
        _rejectOnError: true
    };

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        displayArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to get the details for the scratchOrg
    return sfdx.force.user.display(displayArguments)
        .then(result => {
            return {
                outputDisplay: Object.keys(result)
                    .map(resultKey => [resultKey, result[resultKey]]),
                result: result
            };
        });
};
