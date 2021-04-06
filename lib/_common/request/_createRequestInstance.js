'use strict';

// Initialize constants
const axios = require('axios');
const config = require('config');

/**
 * @function initializeOCAPIRequest
 * @description Initializes a given OCAPI Request
 *
 * @param {Object} targetEnvironment Represents the environment details for the OCAPI request
 * @return {Request} Returns the base-request used to make OCAPI calls
 */
module.exports = targetEnvironment => axios.create({
    baseURL: `https://${targetEnvironment.b2cHostName}`,
    timeout: config.get('b2c.timeout'),
    headers: {},
    responseType: 'json',
    responseEncoding: 'utf8',
    validateStatus: function (status) {
        return status < 500;
    }
});
