'use strict';

// Initialize constants
const config = require('config');
const fs = require('fs');
const path = require('path');

/**
 * @function _createSFTemplateInstance
 * @description Helper function to take the template-instance content and write it to
 * the file-system for deployment to SFDC vi SFDX
 *
 * @param templateFolder {String} Represents the folder shortname where a template instance will be written
 * @param fileSuffix {String} Represents the file-suffix / file-name applied to the template folder
 * @param templateFileContents {String} Represents the file-contents being written
 */
module.exports = (templateFolder, fileSuffix, templateFileContents) => {
    // Create the destination path to the meta-data file being written
    const targetFolderPath = path.join(config.get('paths.source.dx.base').toString(), templateFolder);

    // Validate that the target folder exists
    if (!fs.existsSync(targetFolderPath)) {
        fs.mkdirSync(targetFolderPath, {
            recursive: true
        });
    }

    // Define the filepath to process
    const filePath = path.join(targetFolderPath, fileSuffix);

    // Write the destination file personalized by the environment properties
    fs.writeFileSync(filePath, templateFileContents, 'utf8');

    // Return the filePath
    return filePath;
};
