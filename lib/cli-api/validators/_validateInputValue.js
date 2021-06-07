'use strict';

// Initialize module dependencies
const validate = require('validate.js');

// Initialize any local libraries
const getValidationOutputValue = require('./_getValidationOutputValue');
const setValidationOutputResult = require('./_setValidationOutputResult');

/**
 * @function _validateInputValue
 * @description This function is used to validate that a ClientID is well-formed.
 *
 * @param {*} value Represents the value to validate
 * @param {String} constraint Represents the constraint to use to validate the value
 * @param {String} inputPrefix The prefix to apply to the value (optional)
 *
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = (value, constraint, inputPrefix = '') => {
    // Default the output value
    let output = getValidationOutputValue(value);

    // Define the validation constraints
    const constraints = require(`./constraints/${constraint}`);
    // First, execute the validation rules against the CLI option value
    const validationErrors = validate({
        value: output.value ? `${inputPrefix}${output.value}` : output.value
    }, constraints);

    // Process the test results, and finalize the output object
    output = setValidationOutputResult(output, validationErrors);

    return output;
};
