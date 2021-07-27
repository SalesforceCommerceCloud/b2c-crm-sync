'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfScratchOrgDetails
 * @description Attempts to retrieve the details for a given scratchOrg
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the results of the scratchOrg detail request
 */
module.exports = environmentDef => {
    const displayArguments = {
        _rejectOnError: true
    };

    // Set the username to deploy to if it's defined
    if (Object.prototype.hasOwnProperty.call(environmentDef, 'sfScratchOrgUsername')) {
        displayArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    // Attempt to get the details for the scratchOrg
    return sfdx.force.org.display(displayArguments)
        .then(result => {
            return {
                outputDisplay: Object.keys(result).map(resultKey => [resultKey, result[resultKey]]),
                result: result
            };
        });
};
