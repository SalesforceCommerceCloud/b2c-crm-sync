'use strict';

// Include local libraries
const fsAPI = require('../../lib/_common/fs');

/**
 * @function _b2cDeploySetup
 * @description Attempts to verify the setup of the B2C Commerce deployment folders, and
 * creates the folders if they are missing.
 *
 * @return {Object} Returns the output if a process callback isn't defined
 */
module.exports = () => new Promise((resolve, reject) =>
    fsAPI.setupB2CDeploymentFolders()
        .then(output =>
            resolve(output))
        .catch(err => reject(err)));
