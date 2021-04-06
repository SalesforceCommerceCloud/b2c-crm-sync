'use strict';

// Initialize constants
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const b2cCodeVersionsList = require('../../../lib/cli-api/_b2cCOdeVersionsList');
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getAMAuthSuccessNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMAuthFailureNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');

// Retrieve the nocks used to mock B2C Commerce OCAPI external API requests
const getCodeVersionsFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersionsGet_FailureNock');
const getCodeVersionsSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersionsGet_SuccessNock');

// Exercise the retrieval of the operation mode
describe('Get B2C Commerce Code Versions via the API', function () {

    // Create an instance of the mock command object
    let AMAuthSuccessNock,
        AMAuthFailureNock,
        codeVersionsGetSuccessNock,
        codeVersionsGetFailureNock,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns a collection of code versions for the configured environment', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);

        // Exercise the code-version retrieval process
        b2cCodeVersionsList(runtimeEnvironmentDef)
            .then(resultObj => assert.hasAllKeys({ apiCalls: true, b2cConnProperties: true, environmentDetails: true, b2cCodeVersions: true }, resultObj))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('fails if the required b2c environment properties are not configured correctly', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingHostName');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        AMAuthSuccessNock = getAMAuthSuccessNock();

        // Exercise the site verification process
        b2cCodeVersionsList(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as the configuration is missing the b2cHostName'))
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
        b2cCodeVersionsList(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as the authentication should have failed'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when retrieving code versions', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetFailureNock = getCodeVersionsFailureNock(runtimeEnvironmentDef);

        // Exercise the site verification process
        b2cCodeVersionsList(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });
});
