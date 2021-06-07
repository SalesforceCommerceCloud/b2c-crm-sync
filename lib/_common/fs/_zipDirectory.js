'use strict';

// Initialize constants
const zipLib = require('zip-a-folder');

/**
 * @function zipDirectory
 * @description Attempts to zip the contents of a directory -- and produce an archive
 * stored in the targetArchiveFilePath
 *
 * @param {String} basePath Represents the directory being archived / zipped
 * @param {String} targetArchiveFilePath Represents the full-path (including filename) of the archive being written
 *
 * @returns {Promise} Resolved promise if the zip operation succeed, or a rejected promise in case of error
 */
module.exports = (basePath, targetArchiveFilePath) => new Promise((resolve, reject) => {
    // If not, then move forward with zipping the codebase
    zipLib.zip(basePath, targetArchiveFilePath)
        .catch(e => {
            reject(e);
        })
        .then(function () {
            resolve(true);
        });
});
