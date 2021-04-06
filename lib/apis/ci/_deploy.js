'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci');

/**
 * @function _deploy
 * @description Attempts to deploy the defined code version
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} codeArchive Represents the path of the code-version archive to deploy
 * @param {String} token Represents the authentication token to use to verify the environment
 * @returns {Promise}
 */
module.exports = (environment, codeArchive, token) => new Promise((resolve, reject) => {
    // Debugging: Output the directory to which the storefront data is being uploaded
    console.log(` -- deploying ${codeArchive} to ${environment.b2cHostName}`);

    // Attempt to upload the site-import file specified
    ccci.code.deploy(environment.b2cHostName, codeArchive, token, {
        pfx: environment.b2cCertificatePath,
        passphrase: environment.b2cCertificatePassphrase
    }, (errorObj, codeVersionCreated) => {
        // Was an error response found? If so, then throw it
        if (errorObj) {
            reject(errorObj);
            return;
        }

        resolve(codeVersionCreated);
    });
});
