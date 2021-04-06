'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize test dependencies
const getB2CCodeVersion = require('../../../../lib/cli-api/_common/_getB2CCodeVersion');
const getRuntimeEnvironment = require('../../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../../lib/qa/util/_commandObjMock');

describe('Retrieval of the Configured B2C Commerce Code Version', function () {

    // Initialize local variables
    let commandObj,
        runtimeEnvironmentDef,
        testResult;

    it('returns a composite object with code-version specific property validation results', function () {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Retrieve the code-version properties
        testResult = getB2CCodeVersion(runtimeEnvironmentDef);

        // Validate that all of the object keys are present in the test result
        assert.hasAllKeys({ isValid: true, b2cCodeVersion: true }, testResult);

    });

});
