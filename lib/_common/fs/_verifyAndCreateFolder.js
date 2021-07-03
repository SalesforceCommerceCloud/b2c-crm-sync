'use strict';

// Initialize constants
const fs = require('fs-extra'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp');

/**
 * @function _verifyAndCreateFolder
 * @description Helper function for folder / directory management
 *
 * @param {String} pathToProcess Represents the path being evaluated
 * @param {Boolean} [disablePurge] Controls whether the directory-purge occurs (default = false)
 * @return {Object} Returns a composite object describing the output
 */
module.exports = (pathToProcess, disablePurge = false) => new Promise((resolve, reject) => {
    // Default the output property
    const output = {
        path: pathToProcess,
        verified: false,
        removed: false,
        created: false
    };

    try {
        // Validate that the path folder exists
        output.verified = fs.existsSync(pathToProcess);

        // Does the path exist? And has the purge been disabled?
        if (output.verified === true && disablePurge === false) {
            // Remove the path -- and re-create it
            rimraf.sync(pathToProcess);
            // Flag that the folder was removed
            output.removed = true;
        }

        // Was the folder verified? Or, has the folder been removed?
        if (output.verified === false || output.removed === true) {
            // Re-create the directory
            mkdirp.sync(pathToProcess);
            // Track the the folder was created
            output.created = true;
        }

        output.outputDisplay = [
            pathToProcess,
            output.verified,
            output.removed,
            output.created
        ];

        resolve(output);
    } catch (e) {
        reject(e);
    }
});
