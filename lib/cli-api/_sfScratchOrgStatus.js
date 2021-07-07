'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

const config = require('config');

/**
 * @function _sfScratchOrgStatus
 * @description Attempts to retrieve the remote deploy status of a scratchOrg
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => {
    const statusArguments = {
        local: false,
        remote: false,
        _rejectOnError: true
    };

    // Evaluate if we should show local status
    if (environmentDef.hasOwnProperty('statusLocal') && environmentDef.statusLocal !== undefined) {
        statusArguments.local = environmentDef.statusLocal;
    }

    // Evaluate if we should show remote status
    if (environmentDef.hasOwnProperty('statusRemote') && environmentDef.statusRemote !== undefined) {
        statusArguments.remote = environmentDef.statusRemote;
    }

    // Set the username to deploy to if it's defined
    if (environmentDef.hasOwnProperty('sfScratchOrgUsername')) {
        statusArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    let baseForcePath = config.get('paths.source.dx.base').toString();
    baseForcePath = baseForcePath.replace('./', '');

    // Super-skinny helper function for the map statement below
    function _getFilePathOrFullName(statusObject) {

        // Evaluate that the property exists AND it's not null
        if (statusObject.hasOwnProperty('filePath') && statusObject.filePath !== null) {
            return statusObject.filePath.replace(baseForcePath, '');
        }

        // Default the return property
        return statusObject.fullName;

    }

    // Get source status for first scratch org
    return sfdx.force.source.status(statusArguments)
        .then(statuses => {
            if (!statuses) {
                return {
                    outputDisplay: []
                };
            }

            return {
                outputDisplay: statuses.map(status => [
                    status.state,
                    status.type,
                    _getFilePathOrFullName(status)
                ])
            };

        });
};

