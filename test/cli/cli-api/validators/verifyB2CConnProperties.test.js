'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const verifyB2CConnProperties = require('../../../../lib/cli-api/validators/_verifyPropertyCollection');

describe('Verification of the B2C Connection Properties', function () {
    it('fails if all required properties do not validate', function () {
        // Initialize local variables
        let validationResults,
            optionList,
            testResult,
            expectedResult;

        // Define the expected test results
        expectedResult = false;

        // Initialize the optionList
        optionList = ['b2cHostName', 'b2cClientId', 'b2cClientSecret'];

        // Define the test validation results
        validationResults = {
            b2cHostName: {
                validationResult: true
            },
            b2cClientId: {
                validationResult: true
            },
            b2cClientSecret: {
                validationResult: false
            }
        };

        // Verify the validation results to determine if the connection properties are valid
        testResult = verifyB2CConnProperties(optionList, validationResults);

        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(testResult === expectedResult, `-- testing "${JSON.stringify(validationResults)}" `);

    });


    it('succeeds if all required properties do validate', function () {

        // Initialize local variables
        let validationResults,
            testResult,
            optionList,
            expectedResult;

        // Define the expected test results
        expectedResult = true;

        // Initialize the optionList
        optionList = ['b2cHostName', 'b2cClientId', 'b2cClientSecret'];

        // Define the test validation results
        validationResults = {
            b2cHostName: {
                validationResult: true
            },
            b2cClientId: {
                validationResult: true
            },
            b2cClientSecret: {
                validationResult: true
            }
        };

        // Verify the validation results to determine if the connection properties are valid
        testResult = verifyB2CConnProperties(optionList, validationResults);

        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(testResult === expectedResult, `-- testing "${JSON.stringify(validationResults)}" `);

    });

});
