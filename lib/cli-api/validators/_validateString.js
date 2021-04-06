'use strict';

// Initialize any local libraries
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateString
 * @description This function is used to validate that a B2C String is well-formed.
 *
 * @param {*} configString Represents the B2C Commerce string value
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = configString => validateInputValue(configString, 'String');
