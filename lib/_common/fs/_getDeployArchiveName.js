'use strict';

// Initialize constants
const config = require('config');

// noinspection FunctionWithInconsistentReturnsJS
/**
 * @function _getDeployArchiveName
 * @description Helper function to create deployment full paths from configuration properties
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} pathElement Describes the path suffix to retrieve via the config properties
 * @return {String} Returns the fully-formed deployment path
 */
// eslint-disable-next-line consistent-return
module.exports = (environmentDef, pathElement) => {
    // Are we working first with cartridge archives?
    if (pathElement === config.get('paths.cartridgePathLabel').toString()) {
        // Build out the archive file-name to store cartridges
        return environmentDef.b2cCodeVersion + '.zip';
    // If not, are we working with meta-data archives?
    } else if (pathElement === config.get('paths.metadataPathLabel').toString()) {
        // Build out the archive file-name to store meta-data
        return config.get('fileNames.b2c.metaDataArchive').toString() + '.zip';
    }
};
