'use strict';

// Initialize constants
const config = require('config'),
    fs = require('fs'),
    path = require('path');

/**
 * @function _auditOCAPIConfig.js
 * @description Helper function to audit the contents of an OCAPI configuration.  The configuration is
 * written to the local file-system in JSON format.
 *
 * @param {Object} environmentDef Represents the current configured environment
 * @param {Object} OCAPIConfig Represents the OCAPI configuration being audited
 * @returns {undefined}
 */
module.exports = (environmentDef, OCAPIConfig) => {

    // Initialize local variables
    let configJSON,
        fileName,
        filePath;

    // Serialize the OCAPI configuration results
    configJSON = JSON.stringify(OCAPIConfig, null, 4);

    // Build out the fileName that will be used to write the configuration file
    fileName = `${environmentDef.b2cInstanceName}-${environmentDef.b2cClientId}.ocapi.json`;

    // Get the configuration path and build out the fileName to write
    filePath = [config.get('paths.source.dx.config').toString(), fileName].join(path.sep);

    // Write the file to the config directory
    fs.writeFileSync(filePath, configJSON);

};
