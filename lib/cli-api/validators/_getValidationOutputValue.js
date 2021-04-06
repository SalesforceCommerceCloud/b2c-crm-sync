'use strict';

// Initialize module dependencies
const validate = require('validate.js');
const _ = require('lodash');

/**
 * @function _getValidationOutput
 * @description This function is used to initialize the validationOutput object prior to
 * processing the validation rules for CLI option values.
 *
 * @param {String} cliOptionValue Represents the value of the attribute
 * @return {Object} Returns the validation object object leveraged by the validators
 */
module.exports = cliOptionValue => {
    const output = {
        value: cliOptionValue,
        validationResult: false,
        validationErrors: []
    };

    // If this is a string, then trim the whitespace in the string
    if (validate.isString(output.value)) {
        output.value = cliOptionValue.trim();
    }

    // Is the current CLI option a list?  If so, then split the list into an array
    if (!validate.isEmpty(output.value) && output.value.length > 0 && output.value.indexOf(',') !== -1) {
        output.value = output.value.split(',');
    }

    // If this is an array, iterate over the values and trim the whitespace in each array-value
    if (validate.isArray(output.value)) {
        output.value = output.value.map(optionValue => {
            if (validate.isString(optionValue)) {
                return optionValue.trim();
            }

            return optionValue;
        });

        output.value = _.uniq(output.value);
    }

    return output;
};
