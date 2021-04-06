'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const validateB2CHostName = require('../../../../lib/cli-api/validators/_validateHostName');

describe('Validation of the B2CHostName', function () {

    it('fails if a not-null, undefined, or blank valid B2CHostName is provided', function () {
        [null, undefined, '', '    '].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CHostName(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('strips whitespace from validated B2CHostName values', function () {
        ['  test-001.myb2c.sandbox.com    ', 'test-002.myb2c.sandbox.com ', '   test-003.myb2c.sandbox.com'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CHostName(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isTrue(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('succeeds if a valid B2CHostName is provided', function () {
        ['test-001.myb2csandbox.com', 'test-002.myb2csandbox.com'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CHostName(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isTrue(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('fails if an invalid url for B2CHostName is provided', function () {
        ['test-001', 'test-002.myb2csandbox'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CHostName(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('fails if https:// or http:// is included in the B2CHostName', function () {
        ['http://test-001.myb2csandbox.com', 'https://test-002.myb2csandbox.com'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CHostName(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });
});
