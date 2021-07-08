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
 * @returns {Promise} Returns the result of the namedCredentials creation request
 */
module.exports = async environmentDef => {

    // Define the basepath where the namedCredential template should be rendered
    const basePath = `${config.get('paths.source.dx.base')}${config.get('paths.source.dx.deployPath')}`;
    await commonFs.verifyAndCreateFolder(`${basePath}namedCredentials`);

    // Default the file-extension to use
    const fileExt = config.get('paths.source.dx.meta-ext').toString();
    // Initialize the template folder
    const templateFolder = 'namedCredentials/';
    // Build out the suffix to the template file
    const templateSuffix = 'template_B2C_OOBO.namedCredential' + fileExt;
    // Create the destination file's filename and suffix; personalized with the B2C Instance Name
    // eslint-disable-next-line max-len
    const fileSuffix = `${environmentDef.b2cInstanceName}${config.get('b2c.ooboNamedCredentialSuffix')}.namedCredential${fileExt}`;

    // Create an instance of the OOBO namedCredential for the current B2C Commerce / Salesforce Org environment combination
    return sfTemplateCreator(environmentDef, templateFolder, templateSuffix, fileSuffix, templateFileAsString => {

        // Duplicate the template details
        let output = templateFileAsString;

        // Replace the placeholder with the related environment variables
        output = output.replace('{{B2C_HOSTNAME}}', `https://${environmentDef.b2cHostName}`);
        output = output.replace('{{B2C_INSTANCENAME}}', environmentDef.b2cInstanceName);
        output = output.replace('{{B2C_USERNAME}}', environmentDef.b2cUsername);
        output = output.replace('{{B2C_ACCESSKEY}}', environmentDef.b2cAccessKey);
        output = output.replace('{{B2C_CLIENTSECRET}}', environmentDef.b2cClientSecret);

        // Return the transformed template
        return output;

    });

};
