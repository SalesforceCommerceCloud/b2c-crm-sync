'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const validateB2CClientID = require('../../../../lib/cli-api/validators/_validateB2CClientID');

describe('Validation of the B2CClientID', function () {
    it('fails if a not-null, undefined, or blank valid B2CClientID is provided', function () {
        [null, undefined, '', '    '].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientID(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('strips whitespace from validated B2C ClientID values', function () {
        ['  d    ', 'dd ', '   dd'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientID(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('fails if the B2C ClientID has whitespace within the ID', function () {
        ['th  ree', 'fo  ur'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientID(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('succeeds if a valid B2CClientID is provided', function () {
        ['three', 'four'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CClientID(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isTrue(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });
});
