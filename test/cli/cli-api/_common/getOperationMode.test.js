'use strict';

// Initialize constants
const config = require('config');
const assert = require('chai').assert;

// Initialize dependencies
const getOperationMode = require('../../../../lib/cli-api/_common/_getOperationMode');

describe('Get Operation Mode', function () {

    it('returns the default operation-mode if one isn\'t specified', function () {

        // Initialize local variables
        let output,
            expectedResult;

        // Capture the expected test result
        expectedResult = config.get('operationMode.default').toString();

        // Exercise the getOperationMode function
        output = getOperationMode(undefined);

        // Validate that the returned opMode aligns with the expected result
        assert.isTrue(output === expectedResult, '-- testing "undefined" ');

    });

    it('returns the default operation-mode if an unrecognized one is specified', function () {

        // Initialize local variables
        let output,
            expectedResult;

        // Capture the expected test result
        expectedResult = config.get('operationMode.default').toString();

        // Exercise the getOperationMode function
        output = getOperationMode(config.get('unitTests.invalidOperationMode'));

        // Validate that the returned opMode aligns with the expected result
        assert.isTrue(output === expectedResult, `-- testing "${config.get('unitTests.invalidOperationMode')}" `);

    });

    it('accepts all valid operation modes as defined in the app-configuration', function () {

        // Initialize local variables
        let availableOperationModes,
            thisOperationMode,
            output;

        // Capture the expected test result
        availableOperationModes = config.get('operationMode.validModes');

        // Iterate over the collection of operation modes
        for (let modeIndex = 0; modeIndex < availableOperationModes.length; modeIndex++) {

            // Create a reference to the current operation mode
            thisOperationMode = availableOperationModes[modeIndex];

            // Exercise the getOperationMode function
            output = getOperationMode(thisOperationMode);

            // Validate that the returned opMode aligns with the expected result
            assert.isTrue(output === thisOperationMode, `-- testing "${thisOperationMode}" `);

        }

    });

});
