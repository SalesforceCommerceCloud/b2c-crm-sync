'use strict';

// Initialize constants
const nanoid = require('nanoid-esm');
const config = require('config');
const fs = require('fs');
const path = require('path');

// Include the helper library to retrieve the environment details
const b2cSitesVerify = require('./_b2cSitesVerify');
const createSFTemplateInstance = require('./_common/_createSFTemplateInstance');
const cleanSiteIdForConnectedApp = require('./_common/_cleanSiteIdForConnectedApp');

/**
 * @private
 * @function _renderConnectedAppCredentials
 * @description Helper function to render the connectedAppCredentials template
 * @param appDetails {Object} Represents the connectedAppCredential details to process
 */
function _renderConnectedAppCredentials(appDetails) {
    // Default the base path to the dx configuration directory
    const basePath = config.get('paths.source.dx.config').toString();
    // Create the filePath to render
    const filePath = path.join(basePath, config.get('paths.connectedAppFileName').toString());
    // Stringify the contents of the file
    const fileContents = JSON.stringify(appDetails, null, 2);
    // Write the file to the config directory
    fs.writeFileSync(filePath, fileContents);
}

/**
 * @function _sfConnectedAppsCreate
 * @description Attempts to create a version of the CSP TrustedSites SFDX metadata template
 * leveraging environment data provided.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    const fileExtension = config.get('paths.source.dx.meta-ext').toString();
    const templateFolder = 'connectedApps/';
    let output;

    try {
        // Only generate templates for sites that were validated
        output = await b2cSitesVerify(environmentDef);
        output.totalSites = output.siteResults.success.length;
        output.outputDisplay.siteIds = [];
        output.outputDisplay.siteTemplateResults = {};
        output.outputDisplay.connectedAppCredentials = {
            siteIds: [],
            credentials: {}
        };

        // Build out the suffix to the template file
        const templateSuffix = `template.connectedApp${fileExtension}`;
        // Build out the template path so we can read-in the template as a string
        const templatePath = path.join(config.get('paths.source.dx.templates').toString(), templateFolder, templateSuffix);
        // Read in the template file
        const templateFileAsString = fs.readFileSync(templatePath, 'utf8');

        output.siteResults.success.filter(site => site.status === 200).forEach(site => {
            // Initialize the connectedApp properties and clean-up the siteId incorporated into the connectedApp identifier
            const connectedAppId = `${environmentDef.b2cInstanceName}_${cleanSiteIdForConnectedApp(site.siteId)}_B2C_Integration_Tools`;
            const consumerKey = nanoid(128);
            const consumerSecret = nanoid(32);

            // Replace the template place-holders with unique values
            let templateFileInstanceAsString = templateFileAsString.replace('{{SITEID}}', site.siteId);
            templateFileInstanceAsString = templateFileInstanceAsString.replace('{{CONSUMERKEY}}', consumerKey);
            templateFileInstanceAsString = templateFileInstanceAsString.replace('{{CONSUMERSECRET}}', consumerSecret);
            // Create the destination file's filename and suffix; personalized with the B2C Instance Name
            const fileSuffix = `${connectedAppId}.connectedApp${fileExtension}`;
            // Create and write the template instance in question
            const filePath = createSFTemplateInstance(templateFolder, fileSuffix, templateFileInstanceAsString);
            // Audit the template site and siteResults
            output.outputDisplay.siteIds.push(site.siteId);

            // Audit the connectedApp template results
            output.outputDisplay.siteTemplateResults[site.siteId] = {
                success: true,
                filePath: filePath,
                fileContents: templateFileInstanceAsString
            };
            // Default the object managing connectedApp details
            output.outputDisplay.connectedAppCredentials.siteIds.push(site.siteId);
            // Audit the connected app credential details
            output.outputDisplay.connectedAppCredentials.credentials[site.siteId] = {
                appId: connectedAppId,
                consumerKey: consumerKey,
                consumerSecret: consumerSecret
            };
        });
        // Default the output properties

        output.success = true;

        // Render the connectedApp configuration.json
        _renderConnectedAppCredentials(output.outputDisplay.connectedAppCredentials);

        // If so, carry it forward as such
        resolve(output);
    } catch (e) {
        output.error = e;
        reject(output);
    }
});
