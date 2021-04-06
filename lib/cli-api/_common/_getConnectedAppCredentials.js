'use strict';

// Initialize constants
const config = require('config');
const fs = require('fs');

/**
 * @function getConnectedAppCredentials
 * @description Attempts to read-in the connectedApp credentials rendered by SFDX template generation
 *
 * @param {String} [basePath] Defines the basePath used to override the default configurationFile
 * @return {Object} Returns the generated connectedApp credentials read from the fileSystem
 */
module.exports = (basePath = config.get('paths.source.dx.config').toString()) => {
    try {
        // Create the filePath to render
        const filePath = basePath + config.get('paths.connectedAppFileName').toString();
        // Read the fileContents
        const fileContents = fs.readFileSync(filePath, 'utf8');
        // Deserialize the JSON representation of connectedApp credentials
        return JSON.parse(fileContents);
    } catch (e) {
        console.log(e);
        // Throw an error explaining that the credentials file could not be parsed
        throw new Error(config.get('errors.sf.connectedAppCredentialsParsingError'));
    }
};
