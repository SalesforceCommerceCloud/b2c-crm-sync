'use strict';

// Initialize constants
const assert = require('chai').assert;
const validate = require('validate.js');

// Initialize dependencies
const getValidationOutputValue = require('../../../../lib/cli-api/validators/_getValidationOutputValue');

describe('The Get Validation Output Value Helper', function () {

    it('removes whitespace from it\'s value to be validated', function () {

        // Initialize local variables
        let output,
            b2cTestValues,
            testValue;

        // Create the test values to exercise
        b2cTestValues = ['     one ', ' two ', '   three', 'four    '];

        // Loop over the collection of strings to evaluate
        for (let testIndex = 0; testIndex < b2cTestValues.length; testIndex++) {

            // Create a reference to the current test value
            testValue = b2cTestValues[testIndex];

            // Exercise the validation function
            output = getValidationOutputValue(testValue);

            // Validate that no white-space was found in the processed value
            assert.isTrue(output.value.indexOf(' ') === -1, `-- testing "${testValue}" | ${JSON.stringify(output)}`);

        }

    });

    it('checks if the value can be converted to an array', function () {

        // Initialize local variables
        let output,
            b2cTestValue;

        // Capture the clientID to test with
        b2cTestValue = 'one, two, three';

        // Exercise the validation function
        output = getValidationOutputValue(b2cTestValue);

        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(validate.isArray(output.value), `-- testing "${b2cTestValue}" | ${JSON.stringify(output)}`);

    });

    it('trims all array values of any whitespace', function () {

        // Initialize local variables
        let output,
            b2cTestValue,
            thisTestValue;

        // Capture the clientID to test with
        b2cTestValue = '   one,two   ,   three    ';

        // Exercise the validation function
        output = getValidationOutputValue(b2cTestValue);

        // Loop over the collection of output values
        for (let arrayIndex = 0; arrayIndex < output.value.length; arrayIndex++) {

            // Create a reference to the current array element
            thisTestValue = output.value[arrayIndex];

            // Validate that no white-space was found in the processed value
            assert.isTrue(thisTestValue.indexOf(' ') === -1, `-- testing "${thisTestValue}" | ${JSON.stringify(output)}`);

        }

    });

});
