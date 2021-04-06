'use strict';

// Initialize constants
const config = require('config');

/**
 * @function _getDeployPath
 * @description Helper function to create deployment paths from configuration properties
 *
 * @param {String} pathScope Scopes the deployment to the appropriate sfcc / sfsc folders
 * @param {String} pathElement Describes the path suffix to retrieve via the config properties
 * @return {String} Returns the fully-formed deployment path
 */
module.exports = (pathScope, pathElement) => `${config.get('paths.deploy.base')}${config.get(`paths.deploy.${pathScope}.${pathElement}`).toString()}`;
