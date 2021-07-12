'use strict';

// Initialize constants
const config = require('config'),
    axios = require('axios'),
    axiosRetry = require('axios-retry'),
    // eslint-disable-next-line no-unused-vars
    colors = require('colors');

/**
 * @function initializeOCAPIRequest
 * @description Initializes a given OCAPI Request
 *
 * @param {Object} targetEnvironment Represents the environment details for the OCAPI request
 * @param {Boolean} disableRetry Describes whether the retry should be disabled (ex. for unit tests)
 * @return {AxiosInstance} Returns the base-request used to make OCAPI calls
 */
module.exports = (targetEnvironment, disableRetry = false) => {

    // Initialize local variables
    let axiosClient,
        totalRetryCount,
        retryConfig,
        retryDelay,
        ERROR_500 = 500;

    // Default the retryCount and totalDelay
    totalRetryCount = config.get('b2c.retryCount');
    retryDelay = config.get('b2c.retryDelay');

    // Create the axios instance
    /** type {AxiosInstance} **/
    axiosClient = axios.create({
        baseURL: `https://${targetEnvironment.b2cHostName}`,
        timeout: config.get('b2c.timeout'),
        headers: {},
        responseType: 'json',
        responseEncoding: 'utf8',
        validateStatus: function (status) {
            return status < ERROR_500;
        }
    });

    // Evaluate if the retry should be disabled
    if (disableRetry === false) {

        // Initialize he retry configurations
        retryConfig = {
            retries: totalRetryCount,
            shouldResetTimeout: true,
            retryDelay: (retryCount) => {

                // Output the retry-count in question
                console.log(`        -- Retrying request | attempt ${retryCount} of ${totalRetryCount}`.bold.red);

                // Return the retry-delay to employ
                return retryCount * retryDelay;

            },
            retryCondition: (error) => {

                // Output the error driving the retry
                console.log(`        -- ${error}`.bold.red);

                // Retry on all errors
                return true;

            }

        };

        // Configure the retry configuration
        axiosRetry(axiosClient, retryConfig);

    }

    // Return the client
    return axiosClient;

};
