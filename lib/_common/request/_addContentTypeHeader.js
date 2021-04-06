'use strict';

// Initialize local libraries
const addGenericHeader = require('./_addGenericHeader');

/**
 * @function addContentTypeHeader
 * @description Adds the content-type header to a given request
 *
 * @param {Object} thisRequest Represents the current request being processed
 * @param {String} contentType Represents the content-type being added to the request
 * @returns {Object} Returns the request with the content-type added
 */
module.exports = (thisRequest, contentType) => addGenericHeader(thisRequest, 'Content-Type', contentType);
