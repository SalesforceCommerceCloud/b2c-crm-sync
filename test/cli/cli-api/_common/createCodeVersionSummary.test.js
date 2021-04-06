'use strict';

// Initialize constants
const config = require('config');
const validate = require('validate.js');
const assert = require('chai').assert;

// Initialize dependencies
const createCodeVersionSummary = require('../../../../lib/cli-api/_common/_createCodeVersionSummary');

describe('Creating the Code Version Summary', function () {

    it('successfully generates the summary from the raw REST API code-version output', function () {

        // Initialize local variables
        let codeVersions,
            output;

        // Retrieve the raw code versions to use in this test
        codeVersions = config.get('unitTests.testData.codeVersions');

        // Create the code-version summary
        output = createCodeVersionSummary(codeVersions);

        // Validate that the generated environment is returned as an object
        assert.isTrue(validate.isArray(output), '-- the code-version summary should be an array ');

    });

});
