'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize test dependencies
const getB2CConnProperties = require('../../../../lib/cli-api/_common/_getB2CConnProperties');
const getRuntimeEnvironment = require('../../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../../lib/qa/util/_commandObjMock');

describe('Get B2C Commerce Connection Properties', function () {

    // Initialize local variables
    let commandObj,
        runtimeEnvironmentDef,
        testResult;

    it('returns a composite object with required property validation results', function () {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Retrieve the connection properties
        testResult = getB2CConnProperties(runtimeEnvironmentDef);

        // Validate that all of the object keys are present in the test result
        assert.hasAllKeys({ isValid: true, b2cClientId: true, b2cClientSecret: true, b2cHostName: true }, testResult);

    });

});
