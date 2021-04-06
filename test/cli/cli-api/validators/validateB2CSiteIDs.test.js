'use strict';

// Initialize constants
const _ = require('lodash');
const assert = require('chai').assert;

// Initialize dependencies
const validateB2CSiteIDs = require('../../../../lib/cli-api/validators/_validateB2CSiteIDs');

describe('Validation of the B2CSiteIDs', function () {
    it('fails if not-null, undefined, or blank valid B2C SiteID values are provided', function () {
        // Capture the site IDs to test with
        const b2cTestValues = [null, undefined, '   ', '        '].toString();
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        // Validate that the returned validation result aligns with the expected result
        assert.isFalse(output.validationResult, `-- testing "${b2cTestValues}" `);
    });

    it('fails if the B2C SiteID list could not be transformed to an array', function () {
        // Capture the site IDs to test with
        const b2cTestValues = { siteOne: 'RefArch', siteTwo: 'RefArchGlobal' };
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        // Validate that the returned validation result aligns with the expected result
        assert.isFalse(output.validationResult, `-- testing "${b2cTestValues}" `);
    });

    it('strips whitespace from validated B2C SiteId values', function () {
        // Capture the site IDs to test with
        const b2cTestValues = '  RefArch    , RefArchGlobal ,     RefArchUS';
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(b2cTestValues.split(',').length === output.value.length, `-- testing "${b2cTestValues}" | ${JSON.stringify(output.validationErrors)}`);

        output.value.forEach(siteId => assert.isTrue(output.siteResults[siteId].validationResult === true, `-- testing "${siteId}" | ${JSON.stringify(output.siteResults[siteId])}`));
    });

    it('recognizes partial validation results successfully', function () {
        // Capture the site IDs to test with
        const b2cTestValues = 'RefArch, RefArch Global ,RefArchUS';
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(output.validationResult === 'partial', 'failed attempting to recognize partial validation failures');
    });

    it('succeeds if valid B2C SiteId values are provided', function () {
        // Capture the site IDs to test with
        const b2cTestValues = 'RefArch, RefArchGlobal';
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(output.validationResult, `-- testing "${b2cTestValues}" | ${JSON.stringify(output.validationErrors)} `);
    });

    it('fails if an invalid B2C SiteID is provided', function () {
        // Capture the site IDs to test with
        const b2cTestValues = 'Ref  Arch';
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        // Validate that the returned validation result aligns with the expected result
        assert.isFalse(output.validationResult, `-- testing "${b2cTestValues} | ${JSON.stringify(output.validationErrors)}" `);
    });

    it('de-duplicates repetitive B2C Site IDs', function () {
        // Capture the site IDs to test with
        const b2cTestValues = 'RefArch,RefArch,RefArchGlobal';
        // Exercise the validation function
        const output = validateB2CSiteIDs(b2cTestValues);
        const expectedValue = _.uniq(b2cTestValues.split(','));
        // Validate that the returned validation result aligns with the expected result
        assert.isTrue(output.validationResult, `-- testing "${b2cTestValues} | ${JSON.stringify(output.validationErrors)}" `);
        // Validate that two sites were returned instead of three
        assert.isTrue(expectedValue.length === output.value.length, `-- testing "${b2cTestValues} | ${JSON.stringify(output.validationErrors)}" `);
    });
});
