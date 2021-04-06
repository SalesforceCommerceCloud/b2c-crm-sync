'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci');

// Initialize any local function libraries
const getJobStatus = require('./_getJobStatus');

/**
 * @function importSiteData
 * @description Attempts to upload the defined site archive
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} webDavImportFile Represents the path of the storefront-data archive to upload
 * @param {String} token Represents the authentication token to use to verify the environment
 *
 * @returns {Promise}
 */
module.exports = (environment, webDavImportFile, token) => new Promise((resolve, reject) => {
    // Announce that we've started the site-import process
    console.log(` -- importing [${webDavImportFile}] via the B2C Commerce instance`);

    // Take the archive and attempt to upload the code version that's been zipped
    ccci.instance.import(environment.b2cHostName, webDavImportFile, token, (errorObj, jobDetails) => {
        // Was an error caught? If so, then throw the error
        if (errorObj) {
            reject(errorObj);
            return;
        }

        // Were any job-details found?
        if (jobDetails === null || jobDetails === undefined) {
            // If not, call out the error an assume that another job is in progress
            console.log(` -- error importing job; potentially another import in progress`);
            console.log(` -- please check your OCAPI permissions and sandbox log-files for details`);
            reject('Empty response while importing the job.');
        } else {
            // Otherwise, explain that job is in progress
            console.log(` -- processing job:${jobDetails.job_id} | jobId:${jobDetails.id}`);

            // Retrieve the job status for the import site-data job
            getJobStatus(environment, jobDetails, token).then(result => resolve(result)).catch(e => reject(e));
        }
    });
});
