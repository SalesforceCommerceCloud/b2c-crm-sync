'use strict';

// Initialize constants
const config = require('config');
const assert = require('chai').assert;

// Initialize dependencies
const getProgramOptionDefault = require('../../../../lib/cli-api/_common/_getProgramOptionDefault');

describe('Get Program Option Default', function () {

    // Initialize local variables
    let cliTestOptions;

    // Retrieve the CLI test options
    // eslint-disable-next-line mocha/no-setup-in-describe
    cliTestOptions = config.get('unitTests.cliOptionDefaultTestValues');

    it('returns the option default value from an environment property', function () {

        // Initialize local variables
        let optionKey,
            optionDef,
            expectedResult,
            output;

        // Retrieve the option that will be exercised
        optionKey = cliTestOptions.get('envDefaultOption');

        // Default the test value
        expectedResult = 'TEST';

        // Retrieve the option definition for the env-specific cli option
        optionDef = config.get('cliOptions').get(optionKey);

        // Set the test value that we're expecting
        process.env[optionDef.envProperty] = expectedResult;

        // Retrieve the option default
        output = getProgramOptionDefault(optionKey);

        // Asset that the testResult is equal to the expected value
        assert.isTrue(output === expectedResult, `-- testing "${optionKey}" `);

    });

    it('returns the option default value from a configuration property', function () {

        // Initialize local variables
        let optionKey,
            expectedResult,
            output;

        // Retrieve the option that will be exercised
        optionKey = cliTestOptions.get('configDefaultOption');

        // Default the test value
        expectedResult = config.get(config.get('cliOptions').get(optionKey).get('configProperty'));

        // Retrieve the option default
        output = getProgramOptionDefault(optionKey);

        // Asset that the testResult is equal to the expected value
        assert.isTrue(output === expectedResult, `-- "${optionKey}" `);

    });

});
