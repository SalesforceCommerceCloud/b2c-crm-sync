'use strict';

// Initialize constants
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const b2cCodeVersionActivate = require('../../../lib/cli-api/_b2cCodeVersionActivate');
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getAMAuthSuccessNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMAuthFailureNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');

// Retrieve the nocks used to mock B2C Commerce OCAPI external API requests
const getCodeVersionFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_FailureNock');
const getCodeVersionSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');

// Exercise the retrieval of the operation mode
describe('Activating a B2C Commerce Code Version via the API', function () {

    // Create an instance of the mock command object
    let AMAuthSuccessNock,
        AMAuthFailureNock,
        codeVersionsGetSuccessNock,
        codeVersionsGetFailureNock,
        codeVersionsPatchFailureNock,
        codeVersionsPatchSuccessNock,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('successfully activates a valid and existing code-version', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        AMAuthSuccessNock = getAMAuthSuccessNock();
        codeVersionsPatchSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'get');

        // Exercise the code-version retrieval process
        b2cCodeVersionActivate(runtimeEnvironmentDef)
            .then(resultObj => assert.hasAllKeys({ b2cConnProperties: true, b2cCodeProperties: true, environmentDetails: true, apiCalls: true, b2cCodeVersion: true }, resultObj))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('fails if B2C Commerce authentication fails', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthFailureNock = getAMAuthFailureNock();

        // Exercise the site verification process
        b2cCodeVersionActivate(runtimeEnvironmentDef)
            .catch(e => assert.isNull(e, 'errorObj should be seeded as the authentication should have failed'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when activating code versions', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchFailureNock = getCodeVersionFailureNock(runtimeEnvironmentDef, 'patch');

        // Exercise the site verification process
        b2cCodeVersionActivate(runtimeEnvironmentDef)
            .catch(e => assert.isNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when retrieving the activated code versions', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetFailureNock = getCodeVersionFailureNock(runtimeEnvironmentDef, 'get');

        // Exercise the site verification process
        b2cCodeVersionActivate(runtimeEnvironmentDef)
            .catch(e => assert.isNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('fails if the required b2c environment properties are not configured correctly', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingHostName');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Exercise the site verification process
        b2cCodeVersionActivate(runtimeEnvironmentDef)
            .catch(e => {
                // Validate that the error object is populated
                assert.isNull(e, 'errorObj should be seeded as the configuration is missing the b2cHostName');
                // Validate that the hostname errors are represented in the result object
                assert.isFalse(e.b2cConnProperties.isValid, 'b2cConnProperties should not be valid -- as the hostname is missing');
                assert.isFalse(e.b2cConnProperties.b2cHostName.validationResult, 'b2cConnProperties should not be valid -- as the hostname is missing');
            })
            .finally(() => done());
    });
});
