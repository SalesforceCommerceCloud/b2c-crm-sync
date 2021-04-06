'use strict';

// Initialize constants
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const b2cAuthenticate = require('../../../lib/cli-api/_b2cAuthClientCredentials');
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getAMAuthSuccessNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMAuthFailureNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');

// Exercise the retrieval of the operation mode
describe('Authentication Against B2C Commerce via the API', function () {
    // Create an instance of the mock command object
    let AMAuthSuccessNock,
        AMAuthFailureNock,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns an authentication token for the B2C Commerce environment', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();

        // Exercise the authentication process
        b2cAuthenticate(runtimeEnvironmentDef)
            .then(resultObj => assert.hasAllKeys({ apiCalls: true, b2cConnProperties: true, environmentDetails: true }, resultObj))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('fails if the required b2c environment properties are not configured correctly', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingHostName');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();

        // Exercise the authentication and connection property validation process
        b2cAuthenticate(runtimeEnvironmentDef)
            .catch(e => assert.isNull(e, 'errorObj should be seeded as the configuration is missing the b2cHostName'))
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

        // Exercise the authentication and connection property validation process
        b2cAuthenticate(runtimeEnvironmentDef)
            .catch(e => assert.isNull(e, 'errorObj should be seeded as the authentication should have failed'))
            .finally(() => done());
    });
});
