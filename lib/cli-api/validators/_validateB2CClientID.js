'use strict';

// Initialize any local libraries
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateB2CClientID
 * @description This function is used to validate that a ClientID is well-formed.
 *
 * @param {*} B2CClientIDValue Represents the B2C Commerce clientId (used to authenticate)
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = B2CClientIDValue => validateInputValue(B2CClientIDValue, 'B2CClientID');
