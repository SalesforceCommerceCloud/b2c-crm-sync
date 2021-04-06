'use strict';

// Initialize constants
const moment = require('moment');

/**
 * @function _createB2CCodeVersionSummary
 * @description Helper function used to create a usable / readable summary describing retrieved code-versions

 * @param {Array} codeVersions Represents the collection of code-versions returned by SFCC-CI
 * @return {Array} Returns a collection of code-versions that can be used to via CLI output
 */
module.exports = codeVersions => codeVersions.map(codeVersion => {
    // Create a revised instance of the code version definition
    const cvSummary = {
        id: codeVersion.id,
        active: codeVersion.active,
        // Format the date so it can be cleanly read
        lastModificationTime: moment(new Date(codeVersion.last_modification_time)).format('MM/DD/YY HH:MM:SS'),
        compatibilityMode: codeVersion.compatibility_mode,
        cartridges: codeVersion.cartridges ? codeVersion.cartridges : []
    };

    // Rebuild the webDavUrl to omit the domain from the webDavUrl
    cvSummary.webDavUrl = codeVersion.web_dav_url.replace('https://', '').split('/');
    // Remove the first element (the hostname)
    cvSummary.webDavUrl.splice(0, 3);
    // Rebuild the url structure
    cvSummary.webDavUrl = '/' + cvSummary.webDavUrl.join('/');

    return cvSummary;
});
