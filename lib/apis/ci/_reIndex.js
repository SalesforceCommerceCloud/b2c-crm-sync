'use strict';

// Initialize any required modules
const ccci = require('sfcc-ci');
const config = require('config');

// Initialize any local function libraries
const getJobStatus = require('./_getJobStatus');

/**
 * @function reIndexSiteData
 * @description Attempts to re-index the storefront product and content indexes
 *
 * @param {Object} environment Represents the environment to be interacted with
 * @param {String} token Represents the authentication token to use to verify the environment
 *
 * @returns {Promise}
 */
module.exports = (environment, token) => new Promise((resolve, reject) => {
    const reIndexJobName = config.get('reIndexJobName');

    // Announce that we've started the re-index process
    console.log(' -- re-indexing storefront product and content data');

    // Execute the re-index job for the current environment
    ccci.job.run(environment.b2cHostName, reIndexJobName, {}, token, (errorObj, responseObj) => {
        if (errorObj) {
            reject(errorObj);
            return;
        }

        // Check if the response includes a body property
        if (!responseObj.hasOwnProperty('body')) {
            reject('Body element not found in OCAPI response; aborting');
            return;
        }

        const jobDetails = responseObj.body;
        // Were any job-details retrieved from the response?
        if (!jobDetails) {
            // If not, call out the error an assume that another job is in progress
            console.log(' -- error executing reIndex job; another reIndex in progress');
            reject(' -- error executing reIndex job; another reIndex in progress');
        // Was a fault-element included in the response's body?
        } else if (jobDetails.hasOwnProperty('fault')) {
            // If not, call out the error an assume that another job is in progress
            console.log(` -- ${jobDetails.fault.type}: ${jobDetails.fault.message}`);
            reject(` -- ${jobDetails.fault.type}: ${jobDetails.fault.message}`);
        } else {
            // Otherwise, explain that job is in progress
            console.log(` -- processing job:${jobDetails.job_id} jobId:${jobDetails.id}`);

            // Retrieve the job status for the import site-data job
            getJobStatus(environment, jobDetails, token).then(result => resolve(result)).catch(e => reject(e));
        }
    });
});
