'use strict';

// Initialize constants
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const b2cCodeVersionToggle = require('../../../lib/cli-api/_b2cCodeVersionToggle');
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getAMAuthSuccessNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMAuthFailureNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');

// Retrieve the nocks used to mock B2C Commerce OCAPI external API requests
const getCodeVersionsFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersionsGet_FailureNock');
const getCodeVersionsSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersionsGet_SuccessNock');
const getCodeVersionFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_FailureNock');
const getCodeVersionSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');

// Exercise the retrieval of the operation mode
describe('Toggling the Active B2C Commerce Code Version via the API', function () {

    // Create an instance of the mock command object
    let AMAuthSuccessNock,
        AMAuthFailureNock,
        codeVersionsGetInitialSuccessNock,
        codeVersionsGetToggleSuccessNock,
        codeVersionsGetToggleFailureNock,
        codeVersionsGetActivateSuccessNock,
        codeVersionsGetActivateFailureNock,
        codeVersionsGetFailureNock,
        codeVersionsPatchToggleSuccessNock,
        codeVersionsPatchToggleFailureNock,
        codeVersionsPatchActivateSuccessNock,
        codeVersionsPatchActivateFailureNock,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('fails if the required b2c environment properties are not configured correctly', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingHostName');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Exercise the site verification process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .then(resultObj => {
                // Validate that the hostname errors are represented in the result object
                assert.isFalse(resultObj.b2cConnProperties.isValid, 'b2cConnProperties should not be valid -- as the hostname is missing');
                assert.isFalse(resultObj.b2cConnProperties.b2cHostName.validationResult, 'b2cConnProperties should not be valid -- as the hostname is missing');
            })
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

        // Exercise the code-version toggling process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
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
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when toggling away from the active code-version', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetInitialSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchToggleFailureNock = getCodeVersionFailureNock(runtimeEnvironmentDef, 'patch');

        // Exercise the site verification process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when retrieving the code-version list -- post toggle', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetInitialSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchToggleSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetToggleFailureNock = getCodeVersionsFailureNock(runtimeEnvironmentDef);

        // Exercise the site verification process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when toggling back to the active code-version', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetInitialSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchToggleSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetToggleSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchActivateFailureNock = getCodeVersionFailureNock(runtimeEnvironmentDef, 'patch');

        // Exercise the site verification process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('fails gracefully if an http error is caught when retrieving the code-version list -- post-activation', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetInitialSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchToggleSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetToggleSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchActivateSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetActivateFailureNock = getCodeVersionsFailureNock(runtimeEnvironmentDef);

        // Exercise the site verification process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as an http error was thrown'))
            .finally(() => done());
    });

    it('succeeds at retrieving the post-activate code-version list -- and completes the toggle process', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetInitialSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchToggleSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetToggleSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);
        // eslint-disable-next-line no-unused-vars
        codeVersionsPatchActivateSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'patch');
        // eslint-disable-next-line no-unused-vars
        codeVersionsGetActivateSuccessNock = getCodeVersionsSuccessNock(runtimeEnvironmentDef);

        // Exercise the site verification process
        b2cCodeVersionToggle(runtimeEnvironmentDef)
            .then(toggleResults => assert.hasAllKeys({ b2cConnProperties: true, environmentDetails: true, apiCalls: true, b2cCodeVersions: true, b2cCodeVersionsToggle: true, b2cCodeVersionsActivate: true }, toggleResults))
            .catch(e => assert.isNull(e, 'errorObj should be null, as the toggle process is completed'))
            .finally(() => done());
    });

});
