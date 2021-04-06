'use strict';

// Initialize constants
const config = require('config');

// Initialize any local libraries
const getDeployPath = require('./_getDeployPath');
const verifyAndCreateFolder = require('./_verifyAndCreateFolder');

/**
 * @function setupB2CDeploymentFolders
 * @description This function is used as a pre-cursor activity to setup the temporary / working
 * deployment folder (where cartridges are copied, archived, and deployed to the storefront code-version)
 *
 * @returns {Object} Returns the paths describing the deploy-folder / code-version directories
 */
module.exports = () => Promise.all([
    config.get('paths.deploy.base').toString(),
    getDeployPath(config.get('paths.b2cLabel'), config.get('paths.cartridgePathLabel')),
    getDeployPath(config.get('paths.b2cLabel'), config.get('paths.metadataPathLabel'))
].map(path => verifyAndCreateFolder(path))); // Attach the purge and create results to the current path
