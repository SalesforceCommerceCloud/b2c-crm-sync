'use strict';

// Initialize constants
const config = require('config');

// Include the helper library to retrieve the environment details
const sfTemplateCreator = require('./_sfTemplateCreator');
const commonFs = require('../_common/fs');

/**
 * @function _sfRemoteSitesCreate
 * @description Attempts to create a version of the RemoteSites SFDX metadata template
 * leveraging environment data provided.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the result of the remoteSites creation request
 */
module.exports = async environmentDef => {

    // Define the basepath where the remoteSites template should be rendered
    const basePath = `${config.get('paths.source.dx.base')}${config.get('paths.source.dx.deployPath')}`;
    await commonFs.verifyAndCreateFolder(`${basePath}remoteSiteSettings`);

    // Default the file-extension to use
    const fileExt = config.get('paths.source.dx.meta-ext').toString();
    // Initialize the template folder
    const templateFolder = 'remoteSiteSettings/';
    // Build out the suffix to the template file
    const templateSuffix = 'template.remoteSite' + fileExt;
    // Create the destination file's filename and suffix; personalized with the B2C Instance Name
    const fileSuffix = `${environmentDef.b2cInstanceName}.remoteSite${fileExt}`;

    // Replace the placeholder with the templateUrl
    return sfTemplateCreator(environmentDef, templateFolder, templateSuffix, fileSuffix, templateFileAsString => {
        return templateFileAsString.replace('{{B2C_HOSTNAME}}', `https://${environmentDef.b2cHostName}`);
    });
};
