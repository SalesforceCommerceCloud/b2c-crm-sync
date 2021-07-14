'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');
const config = require('config');

/**
 * @function getFilePathOrFullName
 * @description Skinny helper-function designed to shorthand filepath retrieval
 *
 * @param {Object} statusObject Represents the statusObject containing the base filePath
 * @param {String} baseForcePath Represents the path of the base deployment directory for the SFDC codebase
 * @returns {String} Returns either the filePath or the basePath -- depending on the statusObject
 **/
function getFilePathOrFullName(statusObject, baseForcePath) {

    // Evaluate that the property exists AND it's not null
    if (Object.prototype.hasOwnProperty.call(statusObject, 'filePath') && statusObject.filePath !== null) {
        return statusObject.filePath.replace(baseForcePath, '');
    }

    // Default the return property
    return statusObject.fullName;

}

/**
 * @function _sfOrgStatus
 * @description Attempts to retrieve the remote deploy status of a scratchOrg
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the result of the scratchOrg status request
 */
module.exports = environmentDef => {

    // Initialize the status argument
    const statusArguments = {
        local: false,
        remote: false,
        _rejectOnError: true
    };

    // Evaluate if we should show local status
    if (Object.prototype.hasOwnProperty.call(environmentDef, 'statusLocal')
        && environmentDef.statusLocal !== undefined) {
        statusArguments.local = environmentDef.statusLocal;
    }

    // Evaluate if we should show remote status
    if (Object.prototype.hasOwnProperty.call(environmentDef, 'statusRemote')
        && environmentDef.statusRemote !== undefined) {
        statusArguments.remote = environmentDef.statusRemote;
    }

    // Set the username to deploy to if it's defined
    if (Object.prototype.hasOwnProperty.call(environmentDef, 'sfScratchOrgUsername')) {
        statusArguments.targetusername = environmentDef.sfScratchOrgUsername;
    }

    let baseForcePath = config.get('paths.source.dx.base').toString();
    baseForcePath = baseForcePath.replace('./', '');

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
                    getFilePathOrFullName(status, baseForcePath)
                ])
            };

        }).catch((err) => {
            // if the error is related to a non source tracked org, this is fine, exit gracefully
            if (err.length > 0
                && Object.prototype.hasOwnProperty.call(err[0], 'name')
                && err[0].name === 'NonSourceTrackedOrgError') {
                return {
                    outputDisplay: []
                };
            }
            throw new Error(JSON.stringify(err));
        });
};

