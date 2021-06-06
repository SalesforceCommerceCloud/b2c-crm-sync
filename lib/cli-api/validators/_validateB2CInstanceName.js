'use strict';

// Initialize any local libraries
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateB2CInstanceName
 * @description This function is used to validate that the B2C Instance Name configured is well-formed.
 *
 * @param {*} B2CInstanceNameValue Represents the B2C Commerce Instance Name
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = B2CInstanceNameValue => {
    return validateInputValue(B2CInstanceNameValue, 'B2CInstanceName');
};

