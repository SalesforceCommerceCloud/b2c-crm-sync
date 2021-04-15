'use strict';

// Initialize constants
const config = require('config');
const fs = require('fs');
const path = require('path');

/**
 * @function _b2cServicesCreate
 * @description Attempts to create a version of the services.xml b2C Commerce metadata
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    const output = {};
    try {
        // First, read the connected App credentials file, if it does not exists, abort
        const connectedAppCredentialsFilePath = path.join(config.get('paths.source.dx.config').toString(), config.get('paths.connectedAppFileName').toString());
        if (!fs.existsSync(connectedAppCredentialsFilePath)) {
            reject('The connected app credentials are not available yet. please run the "crm-sync:sf:connectedapps" command first.');
            return;
        }
        const connectedAppCredentials = JSON.parse(fs.readFileSync(connectedAppCredentialsFilePath, 'utf8'));

        const perSiteServiceTemplatePath = path.join(config.get('paths.source.b2c.meta-templates').toString(), 'service_per_site.xml');
        const perSiteServiceTemplateFileAsString = fs.readFileSync(perSiteServiceTemplatePath, 'utf8');
        const perSiteServiceProfileTemplatePath = path.join(config.get('paths.source.b2c.meta-templates').toString(), 'service_profile_per_site.xml');
        const perSiteServiceProfileTemplateFileAsString = fs.readFileSync(perSiteServiceProfileTemplatePath, 'utf8');
        const perSiteServiceCredentialTemplatePath = path.join(config.get('paths.source.b2c.meta-templates').toString(), 'service_credential_per_site.xml');
        const perSiteServiceCredentialTemplateFileAsString = fs.readFileSync(perSiteServiceCredentialTemplatePath, 'utf8');
        const fileName = 'services.xml';
        const targetFolderPath = config.get('paths.source.b2c.metadata').toString();
        const filePath = path.join(targetFolderPath, fileName);
        const templatePath = path.join(config.get('paths.source.b2c.meta-templates').toString(), fileName);
        let templateFileAsString = fs.readFileSync(templatePath, 'utf8');
        let logPrefixLength = 9;
        let allServiceString = '';
        let allServiceProfileString = '';
        let allServiceCredentialString = '';

        // Clean-up the siteList for service-processing
        let siteList = environmentDef.b2cSiteIds.trim();
        siteList = siteList.replace(/\s/g, '');
        siteList = siteList.split(',');

        // Loop over the collection of cleaned-up site identifiers (whitespace removed)
        siteList.filter(siteId => connectedAppCredentials.siteIds.indexOf(siteId) > -1).forEach(siteId => {

            // Create a reference to the connectedApp credentials for the current site
            const { consumerKey, consumerSecret } = connectedAppCredentials.credentials[siteId];

            // Perform the service template
            let serviceTemplateString = `${perSiteServiceTemplateFileAsString}`;
            // Use a regex to replace the site ID as it appears multiple times within the template file
            serviceTemplateString = serviceTemplateString.replace(/{{B2C_SITEID}}/gm, siteId);

            // Use a regex to replace the log prefix site ID, errors after 25 characters
            let logPrefixSiteId = siteId;
            if (logPrefixLength + logPrefixSiteId.length > 25) {
                // remove underscores and dashes and limit site id to first 16 characters
                logPrefixSiteId = logPrefixSiteId.replace(/[_-]/g, '').substring(0, 16);
            }
            serviceTemplateString = serviceTemplateString.replace(/{{B2C_SITEID_LOG_PREFIX}}/gm, logPrefixSiteId);

            allServiceString += `\n${serviceTemplateString}`;

            // Perform the service profile template
            let serviceProfileTemplateString = `${perSiteServiceProfileTemplateFileAsString}`;
            // Use a regex to replace the site ID as it appears multiple times within the template file
            serviceProfileTemplateString = serviceProfileTemplateString.replace(/{{B2C_SITEID}}/gm, siteId);
            allServiceProfileString += `\n${serviceProfileTemplateString}`;

            // Perform the service credential template
            let serviceCredentialTemplateString = `${perSiteServiceCredentialTemplateFileAsString}`;
            // Use a regex to replace the site ID as it appears multiple times within the template file
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace(/{{B2C_SITEID}}/gm, siteId);
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace('{{SF_LOGINURL}}', environmentDef.sfLoginUrl);
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace('{{SF_USERNAME}}', environmentDef.sfUsername);
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace('{{SF_PASSWORD}}', '<![CDATA[' + environmentDef.sfPassword + ']]>');
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace('{{SF_SECURITYTOKEN}}', '<![CDATA[' + environmentDef.sfSecurityToken + ']]>');
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace('{{SF_CONSUMERKEY}}', '<![CDATA[' + consumerKey + ']]>');
            serviceCredentialTemplateString = serviceCredentialTemplateString.replace('{{SF_CONSUMERSECRET}}', '<![CDATA[' + consumerSecret + ']]>');
            allServiceCredentialString += `\n${serviceCredentialTemplateString}`;
        });

        // Replace the placeholder with all the services details
        templateFileAsString = templateFileAsString.replace('{{ALL_SERVICES}}', `${allServiceCredentialString}\n${allServiceProfileString}\n${allServiceString}`);

        // Create the destination path to the meta-data file being written
        if (!fs.existsSync(targetFolderPath)) {
            fs.mkdirSync(targetFolderPath, { recursive: true });
        }

        // Write the destination file personalized by the environment properties
        fs.writeFileSync(filePath, templateFileAsString, 'utf8');

        // Default the output properties
        output.success = true;
        output.filePath = filePath;
        output.fileContents = templateFileAsString;
        resolve(output);
    } catch (e) {
        reject(e);
    }
});
