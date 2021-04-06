'use strict';

// Initialize any local libraries
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateB2CCodeVersion
 * @description This function is used to validate that a B2C code version is well-formed.
 *
 * @param {*} B2CCodeVersion Represents the B2C Commerce code-version
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = B2CCodeVersion => validateInputValue(B2CCodeVersion, 'B2CCodeVersion');

