'use strict';

// Initialize constants
const config = require('config');
const validate = require('validate.js');
const assert = require('chai').assert;

// Initialize dependencies
const createRuntimeEnvironment = require('../../../../lib/cli-api/_common/_createRuntimeEnvironment');

describe('Creating the Runtime Environment', function () {

    // Initialize global variables
    let baselineEnvironment;

    // Default the baseline environment
    // eslint-disable-next-line mocha/no-setup-in-describe
    baselineEnvironment = config.get('unitTests.baselineEnvironment');

    it('returns an environment configuration informed by the baseline environment', function () {

        // Initialize local variables
        let output;

        // Capture the expected test result
        output = createRuntimeEnvironment(baselineEnvironment);

        // Validate that the generated environment is returned as an object
        assert.isTrue(validate.isObject(output), `-- testing ${JSON.stringify(output)} is an object `);

    });

    it('includes all baseline environment properties that map to CLI options', function () {

        // Initialize local variables
        let output,
            cliOptions,
            cliOptionProperties,
            environmentProperties,
            thisCliOption,
            thisEnvironmentProperty,
            cliOptionCount,
            environmentPropertyCount;

        // Retrieve the collection of cliOptions
        cliOptions = config.util.toObject(config.get('cliOptions'));

        // Default the counts used to validate our test
        cliOptionCount = 0;
        environmentPropertyCount = 0;

        // Capture the expected test result
        output = createRuntimeEnvironment(baselineEnvironment);

        // Build out the key-lists used to validate environment counts
        cliOptionProperties = Object.keys(cliOptions);
        environmentProperties = Object.keys(output);

        // Count the number of cliOption properties found in the generated environment
        for (let propIndex = 0; propIndex < cliOptionProperties.length; propIndex++) {

            // Create a reference to the current CLI property
            thisCliOption = cliOptionProperties[propIndex];

            // Validate that the current environment property was found in the baseline environment
            if (output.hasOwnProperty(cliOptions[thisCliOption].envProperty)) { cliOptionCount += 1; }

        }

        // Count the number of environments properties found in the CLI option definition
        for (let envPropIndex = 0; envPropIndex < environmentProperties.length; envPropIndex++) {

            // Create a reference to the current environment property
            thisEnvironmentProperty = environmentProperties[envPropIndex];

            // Count the number of cliOption properties found in the generated environment
            for (let propIndex = 0; propIndex < cliOptionProperties.length; propIndex++) {

                // Create a reference to the current CLI property
                thisCliOption = cliOptionProperties[propIndex];

                // Validate that the current environment property was found in the CLI option collection
                if (cliOptions[thisCliOption].envProperty === thisEnvironmentProperty) { environmentPropertyCount += 1; }

            }

        }

        // Validate that the cliOptions were found in the environment, and the environment properties were found in the cliOptions
        assert.isTrue(cliOptionCount === environmentPropertyCount, '-- cliOption and environmentProperties don\'t match ');


    });

});
