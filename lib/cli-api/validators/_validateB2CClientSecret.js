'use strict';

// Initialize any local libraries
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateB2CClientSecret
 * @description This function is used to validate that a ClientID is well-formed.
 *
 * @param {*} B2CClientSecretValue Represents the B2C Commerce clientSecret (used to authenticate)
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = B2CClientSecretValue => validateInputValue(B2CClientSecretValue, 'B2CClientSecret');
