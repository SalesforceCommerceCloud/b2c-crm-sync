'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci');

/**
 * @function _upload
 * @description Attempts to upload the defined site archive
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} siteArchive Represents the path of the storefront-data archive to upload
 * @param {String} token Represents the authentication token to use to verify the environment
 *
 * @returns {Promise}
 */
module.exports = (environment, siteArchive, token) => new Promise((resolve, reject) => {
    // Debugging: Output the directory to which the storefront data is being uploaded
    console.log(` -- uploading ${siteArchive} to ${environment.b2cHostName}`);

    // Attempt to upload the site-import file specified
    ccci.instance.upload(environment.b2cHostName, siteArchive, token, {
        pfx: environment.b2cCertificatePath,
        passphrase: environment.b2cCertificatePassphrase
    }, errorObj => {
        // Was an error response found? If so, then throw it
        if (errorObj) {
            reject(errorObj);
            return;
        }

        resolve();
    });
});
