'use strict';

// Initialize constants
const config = require('config');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const colors = require('colors');

/**
 * @function initializeOCAPIRequest
 * @description Initializes a given OCAPI Request
 *
 * @param {Object} targetEnvironment Represents the environment details for the OCAPI request
 * @return {AxiosInstance} Returns the base-request used to make OCAPI calls
 */
module.exports = targetEnvironment => {

    // Initialize local variables
    let axiosClient,
        totalRetryCount,
        retryDelay;

    // Default the retryCount and totalDelay
    totalRetryCount = config.get('b2c.retryCount');
    retryDelay = config.get('b2c.retryDelay');

    // Create the axios instance
    axiosClient = axios.create({
        baseURL: `https://${targetEnvironment.b2cHostName}`,
        timeout: config.get('b2c.timeout'),
        headers: {},
        responseType: 'json',
        responseEncoding: 'utf8',
        validateStatus: function (status) {
            return status < 500;
        }
    });

    // Configure the retry configuration
    axiosRetry(axiosClient, {
        retries: totalRetryCount,
        shouldResetTimeout: true,
        retryDelay: (retryCount) => {

            // Output the retry-count in question
            console.log(`        -- retrying request: attempt ${retryCount} of ${totalRetryCount}`.bold.red);

            // Return the retry-delay to employ
            return retryCount * retryDelay;

        },
        retryCondition: (error) => {

            // Output the error driving the retry
            console.log(`        -- request error: ${error}`.bold.red);

            // Retry on all errors
            return true;

        }
    });

    // Return the client
    return axiosClient;

};
