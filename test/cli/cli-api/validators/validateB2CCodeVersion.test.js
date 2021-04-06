'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const validateB2CCodeVersion = require('../../../../lib/cli-api/validators/_validateB2CCodeVersion');

describe('Validation of the B2CCodeVersion', function () {

    it('fails if a not-null, undefined, or blank valid B2CCodeVersion is provided', function () {
        [null, undefined, '', '    '].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CCodeVersion(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('strips whitespace from validated B2CCodeVersion values', function () {
        [' codeversion_000', '  codeversion_000 ', '   codeversion_000'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CCodeVersion(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isTrue(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('succeeds if a valid B2CCodeVersion is provided', function () {
        ['code_version_v000', 'code000_version_v100'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CCodeVersion(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isTrue(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });

    it('fails if an invalid B2CCodeVersion is provided', function () {
        ['000code_version_v000', 'code000-version-v100', 'code000 version v100', 'code000_version@v100'].forEach(testValue => {
            // Exercise the validation function
            const output = validateB2CCodeVersion(testValue);
            // Validate that the returned validation result aligns with the expected result
            assert.isFalse(output.validationResult, `-- testing "${testValue}" | ${JSON.stringify(output.validationErrors)}`);
        });
    });
});
