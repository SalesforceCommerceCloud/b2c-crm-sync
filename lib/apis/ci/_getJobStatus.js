'use strict';

// Initialize required libraries
const ccci = require('sfcc-ci');
const config = require('config');
const moment = require('moment');
const asyncPolling = require('async-polling');

/**
 * @typedef {Object} jobDetails
 * @description Represents the collection of jobDetails returned via OCAPI
 *
 * @property {String} job_id The primary key for the parent job-record.
 * @property {String} id The primary-key of the job-details record.
 * @property {String} execution_status Represents the recorded execution-status of the in-progress job.
 */

/**
 * @function getJobStatus
 * @description This function is used to report on the job-status for a given B2C Commerce scheduled
 * job currently in flight; it polls via OCAPI to retrieve the job status at a configured interval
 *
 * @param {Object} environment Describes the Salesforce B2C Commerce environment
 * @param {Object} jobDetails Describes the job-details / identification of the job being queried
 * @param {String} token Represents the authorization token used to inquire re: job-status
 *
 * @returns {Promise}
 */

// Export the function
module.exports = (environment, jobDetails, token) => new Promise((resolve, reject) => {
    // Define the polling interval
    const pollingInterval = config.get('b2c.pollingInterval');
    const validPollingStates = config.get('b2c.validPollingStatuses');
    const unknownPollingStatusThreshold = config.get('b2c.unknownPollingStatusThreshold');

    // Initialize local variables
    let unknownPollingStatusCount = 0;

    // Otherwise, let's poll for the status of the job
    const polling = asyncPolling(end => {
        // Query the job status for the data import
        ccci.job.status(
            environment.b2cHostName,
            jobDetails.job_id,
            jobDetails.id,
            token,
            (errorObj, response) => {
                // Check if an error was defined or returned
                if (errorObj) {
                    end(errorObj);
                    return;
                }

                end(null, response);
            });

        // Specify the interval and kick-off the polling
    }, pollingInterval);

    // Inspect the polling results
    polling.on('result', jobStatus => {
        // Was a valid job status retrieved?
        if (!jobStatus || !jobStatus.hasOwnProperty('job_id')) {
            // Debugging: Call out that we couldn't resolve the job identifiers
            console.log(` -- unable to resolve job-properties | ${moment().format('LTS')} | UNKNOWN (UNKNOWN)`);

            // Increment the unknown polling status count
            unknownPollingStatusCount++;

            // If the status count exceeds the threshold -- throw an error
            if (unknownPollingStatusCount > unknownPollingStatusThreshold) {
                reject('Error: unknown polling status count exceeded configured limit; aborting');
                return;
            }
        // Confirm that we have a valid jobStatus record before generating debug-logging
        } else if (jobStatus.hasOwnProperty('job_id')) {
            // Debugging: Call out the current polling status for the job being processed
            console.log(` -- ${jobStatus.job_id}.${jobStatus.id} | ${moment().format('LTS')} | ${jobStatus.status} (${jobStatus.execution_status})`);

            // Was an 'OK' status provided?
            if (jobStatus.status === 'OK') {
                // Stop the polling
                polling.stop(resolve(jobStatus));
                // Was an non-valid / expected polling status provided
            } else if (validPollingStates.indexOf(jobStatus.status) === -1) {
                // Debugging: If so, then output the current polling state
                console.log(` -- error / invalid polling state: ${jobStatus.status}`);

                // Stop the polling
                polling.stop(reject(jobStatus.step_executions[0].exit_status.message));
            }
        }
    });

    // Debugging: Call-out that polling has started
    polling.on('run', function () {
        // Debugging: Audit and call-out that polling has started / describe the interval
        console.log(` -- polling started for ${environment.b2cHostName}`);
        console.log(` -- polling interval set to ${pollingInterval}ms`);
    });

    // Kick off the polling logic
    polling.run();
});
