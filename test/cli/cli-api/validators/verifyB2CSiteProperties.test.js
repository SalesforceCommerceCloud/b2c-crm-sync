'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const verifyB2CSiteProperties = require('../../../../lib/cli-api/validators/_verifyB2CSiteProperties');

describe('Verification of the B2C Site Properties', function () {

    it('successfully recognizes partial validation failures for configured sites', function () {

        // Initialize local variables
        let siteValidationResults,
            testResult,
            expectedResult;

        // Define the expected test results
        expectedResult = 'partial';

        // Mock the validation results
        siteValidationResults = {
            value: ['RefArch', 'RefArchGlobal', 'RefArchUS'],
            validationResult: false,
            validationErrors: [' -- this is a false error'],
            siteResults: {
                RefArch: {
                    value: 'RefArch',
                    validationResult: true,
                    validationErrors: []
                },
                RefArchGlobal: {
                    value: 'RefArchGlobal',
                    validationResult: false,
                    validationErrors: [' -- this is a false error']
                },
                RefArchUS: {
                    value: 'RefArchUS',
                    validationResult: true,
                    validationErrors: []
                }
            }
        };

        // Verify the validation results to determine if the connection properties are valid
        testResult = verifyB2CSiteProperties(siteValidationResults);

        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(testResult === expectedResult, `-- testing "${JSON.stringify(siteValidationResults)}" `);

    });

    it('fails if all configures sites fail validation', function () {

        // Initialize local variables
        let siteValidationResults,
            testResult,
            expectedResult;

        // Define the expected test results
        expectedResult = false;

        // Mock the validation results
        siteValidationResults = {
            value: ['Ref Arch', 'RefArch Global', 'RefArc hUS'],
            validationResult: false,
            validationErrors: [' -- this is a false error'],
            siteResults: {
                'Ref Arch': {
                    value: 'Ref Arch',
                    validationResult: false,
                    validationErrors: [' -- this is a false error']
                },
                'RefArch Global': {
                    value: 'RefArch Global',
                    validationResult: false,
                    validationErrors: [' -- this is a false error']
                },
                'RefArc hUS': {
                    value: 'RefArc hUS',
                    validationResult: false,
                    validationErrors: [' -- this is a false error']
                }
            }
        };

        // Verify the validation results to determine if the connection properties are valid
        testResult = verifyB2CSiteProperties(siteValidationResults);

        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(testResult === expectedResult, `-- testing "${JSON.stringify(siteValidationResults)}" `);

    });

    it('succeeds if all B2C Commerce Site IDs do validate', function () {

        // Initialize local variables
        let siteValidationResults,
            testResult,
            expectedResult;

        // Define the expected test results
        expectedResult = true;

        // Define the test validation results
        siteValidationResults = {
            value: ['RefArch', 'RefArchGlobal', 'RefArchUS'],
            validationResult: true,
            validationErrors: [],
            siteResults: {
                RefArch: {
                    value: 'RefArch',
                    validationResult: true,
                    validationErrors: []
                },
                RefArchGlobal: {
                    value: 'RefArchGlobal',
                    validationResult: true,
                    validationErrors: []
                },
                RefArchUS: {
                    value: 'RefArchUS',
                    validationResult: true,
                    validationErrors: []
                }
            }
        };

        // Verify the validation results to determine if the B2C Sites are valid
        testResult = verifyB2CSiteProperties(siteValidationResults);

        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(testResult === expectedResult, `-- testing "${JSON.stringify(siteValidationResults)}" `);

    });

});
