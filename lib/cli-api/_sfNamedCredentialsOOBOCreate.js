'use strict';

// Initialize constants
const config = require('config');

// Include the helper library to retrieve the environment details
const sfTemplateCreator = require('./_sfTemplateCreator');
const commonFs = require('../_common/fs');

/**
 * @function _sfNamedCredentialsOOBOCreate
 * @description Attempts to create a version of the OOBO / BM UserGrant Named Credential SFDX
 * metadata template leveraging environment data provided.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = async environmentDef => {
    await commonFs.verifyAndCreateFolder(`${config.get('paths.source.dx.force-app')}namedCredentials`);

    // Default the file-extension to use
    const fileExt = config.get('paths.source.dx.meta-ext').toString();
    // Initialize the template folder
    const templateFolder = 'namedCredentials/';
    // Build out the suffix to the template file
    const templateSuffix = 'template_B2C_OOBO.namedCredential' + fileExt;
    // Create the destination file's filename and suffix; personalized with the B2C Instance Name
    const fileSuffix = `${environmentDef.b2cInstanceName}_B2C_OOBO.namedCredential${fileExt}`;

    return sfTemplateCreator(environmentDef, templateFolder, templateSuffix, fileSuffix, templateFileAsString => {
        // Replace the placeholder with the related environment variables
        templateFileAsString = templateFileAsString.replace('{{B2C_HOSTNAME}}', `https://${environmentDef.b2cHostName}`);
        templateFileAsString = templateFileAsString.replace('{{B2C_INSTANCENAME}}', environmentDef.b2cInstanceName);
        templateFileAsString = templateFileAsString.replace('{{B2C_USERNAME}}', environmentDef.b2cUsername);
        templateFileAsString = templateFileAsString.replace('{{B2C_ACCESSKEY}}', environmentDef.b2cAccessKey);
        templateFileAsString = templateFileAsString.replace('{{B2C_CLIENTSECRET}}', environmentDef.b2cClientSecret);
        return templateFileAsString;
    });
};
