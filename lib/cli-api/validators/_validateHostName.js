/* eslint-disable camelcase */
'use strict';

// Initialize module dependencies
const validate = require('validate.js'),
    validator = require('validator'),

    // Initialize any local libraries
    validateInputValue = require('./_validateInputValue'),
    getValidationOutputValue = require('./_getValidationOutputValue');

/**
 * @function _validateHostName
 * @description This function is used to validate that a HostName is a valid domain
 *
 * @param {*} hostNameValue Represents the B2C Commerce HostName describing the target environment
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = hostNameValue => {
    // Default the output value
    const output = getValidationOutputValue(hostNameValue);

    if (validate.isEmpty(output.value)) {
        output.validationErrors = ['-- hostname should not be null or undefined'];
        output.validationResult = false;
        return output;
    }

    // Validate that the value provided does not begin with http or https
    if (
        !validate.isEmpty(output.value) &&
        validator.isURL(
            output.value,
            {
                require_protocol: true,
                require_valid_protocol: true,
                protocols: ['http', 'https']
            }
        )
    ) {
        output.validationErrors = ['-- hostnames should not begin with protocol declarations (ex. https://)'];
        output.validationResult = false;
        return output;
    }

    return validateInputValue(hostNameValue, 'B2CHostName', 'data://');
};
