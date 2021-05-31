'use strict';

// Initialize local libraries
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function addBearerToken
 * @description Adds the authorization header to the request
 *
 * @param {Object} thisRequest Represents the current request being processed
 * @param {String} base64Credential Represents the base64 credential used for authentication
 * @returns {Object} Returns the request with the bearer token added
 */
module.exports = (thisRequest, base64Credential) => addGenericHeader(thisRequest, 'Authorization', `Basic ${base64Credential}`);
