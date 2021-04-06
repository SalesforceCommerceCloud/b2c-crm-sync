'use strict';

const fsextra = require('fs-extra');
const path = require('path');

// Initialize constants
const config = require('config');

// Include local libraries
const fsAPI = require('../../lib/_common/fs');

/**
 * @function _b2cZip
 * @description Attempts to create a .zip directory and archive the contents.
 *
 * @param {Object} [environmentDef] Represents the environment definition arguments passed to this method
 * @param {String} pathScope Describes the scope for the deployment folder (sfcc vs sfsc)
 * @param {String} pathElement Describes the parent sub-folder to be processed
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, pathScope, pathElement) => new Promise(async (resolve, reject) => {
    // Initialize the output property
    const output = {
        ouputDisplay: [],
        archiveName: null,
        paths: {
            sourcePath: config.get(`paths.source.b2c.${pathElement}`),
            targetPath: fsAPI.getDeployPath(pathScope, pathElement)
        },
        verify: null,
        errors: null
    };
    output.archiveName = fsAPI.getDeployArchiveName(environmentDef, pathElement);
    output.paths.tempRootPath = path.join(config.get('paths.deploy.base'), '_temp');
    output.paths.tempPath = path.join(output.paths.tempRootPath, output.archiveName.replace(path.extname(output.archiveName), ''));

    // Build out the archive path including the file-name
    output.paths.fullPath = output.paths.targetPath + output.archiveName;

    try {
        // Validate the target folder exists
        output.verify = await fsAPI.verifyAndCreateFolder(output.paths.targetPath, true);
        output.verify = output.verify && await fsAPI.verifyAndCreateFolder(output.paths.tempPath, true);
        // Copy the content of the source folder into the target folder
        fsextra.copySync(output.paths.sourcePath, output.paths.tempPath);
        // Zip the directory results -- and render the results
        const success = await fsAPI.zipDirectory(output.paths.tempRootPath, output.paths.fullPath);
        // Remove the temporary created folder
        fsextra.rmdirSync(output.paths.tempRootPath, { recursive: true });
        // Audit the archive processing results
        output.ouputDisplay.push(output.paths.fullPath);
        output.ouputDisplay.push(pathElement);
        output.ouputDisplay.push(success);
        resolve(output);
    } catch (e) {
        output.error = e;
        reject(output);
    }
});
