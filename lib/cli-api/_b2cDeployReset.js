'use strict';

// Include local libraries
const fsAPI = require('../../lib/_common/fs');

/**
 * @function _b2cDeployReset
 * @description Attempts to purge the contents of the B2C deployment data-folder (where all deployment
 * archives are stored for deployment processing.
 *
 * @param {String} pathScope Describes the scope for the deployment folder (sfcc vs sfsc)
 * @param {String} pathElement Describes the parent sub-folder to be processed
 *
 * @returns {Promise}
 */
module.exports = (pathScope, pathElement) => new Promise((resolve, reject) => fsAPI.verifyAndCreateFolder(fsAPI.getDeployPath(pathScope, pathElement)).then(output => resolve(output)).catch(e => reject(e)));
