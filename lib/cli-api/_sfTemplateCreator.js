'use strict';

// Initialize constants
const fs = require('fs');
const path = require('path');

const config = require('config');

// Include the helper library to retrieve the environment details
const createSFTemplateInstance = require('./_common/_createSFTemplateInstance');

/**
 * @function _sfTemplateCreator
 * @description Attempts to create a version of the given template file, based on the environment definition from the given command object
 *
 * @param {Object} [commandObj] Represents the commandObject arguments passed to this method
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, templateFolder, templateSuffix, fileSuffix, transformator) => new Promise((resolve, reject) => {
    const output = {};

    try {
        // Build out the template path so we can read-in the template as a string
        const templatePath = path.join(config.get('paths.source.dx.templates').toString(), templateFolder, templateSuffix);
        // Read in the template file
        let templateFileAsString = fs.readFileSync(templatePath, 'utf8');
        // Transform the template with the environment definition values
        templateFileAsString = transformator(templateFileAsString);
        // Create and write the template instance in question
        const filePath = createSFTemplateInstance(templateFolder, fileSuffix, templateFileAsString);
        // Default the output properties
        output.success = true;

        // Seed the filePath and contents properties
        output.filePath = filePath;
        output.fileContents = templateFileAsString;

        resolve(output);
    } catch (e) {
        reject(e);
    }
});
