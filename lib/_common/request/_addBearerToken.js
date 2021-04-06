'use strict';

// Initialize local libraries
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function addBearerToken
 * @description Adds the authorization header to the request
 *
 * @param {Object} thisRequest Represents the current request being processed
 * @param {String} bearerToken Represents the bearer token to be added to the request
 * @returns {Object} Returns the request with the bearer token added
 */
module.exports = (thisRequest, bearerToken) => addGenericHeader(thisRequest, 'Authorization', `Bearer ${bearerToken}`);
