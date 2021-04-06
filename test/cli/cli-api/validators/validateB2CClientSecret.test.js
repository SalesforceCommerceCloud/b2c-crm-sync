'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const validateB2CClientSecret = require('../../../../lib/cli-api/validators/_validateB2CClientSecret');

describe('Validation of the B2CClientSecret', function () {
    it('fails if a not-null, undefined, or blank valid B2CClientSecret is provided', function () {
        [null, undefined, '', '    '].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientSecret(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('strips whitespace from validated B2CClientSecret values', function () {
        ['  d    ', 'dd ', '   dd'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientSecret(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('succeeds if a valid B2CClientSecret is provided', function () {
        ['one', ' two '].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientSecret(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isTrue(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });
});
