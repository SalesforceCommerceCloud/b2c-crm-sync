'use strict';

// Initialize constants
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const b2cVerify = require('../../../lib/cli-api/_b2cVerify');
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getAMAuthSuccessNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMAuthFailureNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');
const getSiteDetailsGetSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_SuccessNock');
const getSiteDetailsGetFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_FailureNock');
const getCodeVersionSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');
const getCodeVersionFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_FailureNock');

// Exercise the retrieval of the operation mode
describe('Verify a B2C Commerce Configuration via the API', function () {
    // Create an instance of the mock command object
    let AMAuthSuccessNock,
        AMAuthFailureNock,
        codeVersionSuccessNock,
        codeVersionFailureNock,
        siteGetSuccessNock1,
        siteGetSuccessNock2,
        siteGetFailureNock1,
        siteGetFailureNock2,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('fails if the b2c environment is missing a b2cHostName', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingHostName');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .then(resultObj => {
                // Validate that the hostname errors are represented in the result object
                assert.isFalse(resultObj.b2cConnProperties.isValid, 'b2cConnProperties should not be valid -- as the hostname is missing');
                assert.isFalse(resultObj.b2cConnProperties.b2cHostName.validationResult, 'b2cConnProperties should not be valid -- as the hostname is missing');
            })
            .catch(e => {
                assert.isNull(e, 'did not expect an error to be thrown');
            })
            .finally(() => {
                done();
            });
    });

    it('fails if the b2c environment is missing a b2cClientId', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingClientId');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e.b2cConnProperties.error, 'error should be seeded as the configuration is missing the b2cClientId'))
            .finally(() => done());
    });

    it('fails if the b2c environment is missing a b2cClientSecret', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingClientSecret');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e.b2cConnProperties.error, 'error should be seeded as the configuration is missing the b2cClientSecret'))
            .finally(() => done());
    });

    it('completes successfully when the b2c configuration is setup correctly', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock(3);
        // eslint-disable-next-line no-unused-vars
        siteGetSuccessNock1 = getSiteDetailsGetSuccessNock(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[0].trim());
        // eslint-disable-next-line no-unused-vars
        siteGetSuccessNock2 = getSiteDetailsGetSuccessNock(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[1].trim());
        // eslint-disable-next-line no-unused-vars
        codeVersionSuccessNock = getCodeVersionSuccessNock(runtimeEnvironmentDef, 'get');

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .then(resultObj => {
                // Validate that no errors were caught during validation
                assert.isNull(resultObj.validation.b2cAuthenticate.error, 'error for b2cAuthenticate should be empty -- as verification should be successful');
                assert.isNull(resultObj.validation.verifyB2CSites.error, 'error for verifyB2CSites should be empty -- as verification should be successful');
                assert.isNull(resultObj.validation.verifyB2CCodeVersion.error, 'error for verifyB2CCodeVersion should be empty -- as verification should be successful');
            })
            .finally(() => done());
    });

    it('fails gracefully if authentication fails', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthFailureNock = getAMAuthFailureNock();

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e.validation.b2cAuth.error, 'error for b2cAuth should be seed -- as authentication failed'))
            .finally(() => done());
    });

    it('fails gracefully if site validation fails', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock(2);
        // eslint-disable-next-line no-unused-vars
        siteGetFailureNock1 = getSiteDetailsGetFailureNock(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[0].trim());
        // eslint-disable-next-line no-unused-vars
        siteGetFailureNock2 = getSiteDetailsGetFailureNock(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[1].trim());
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getCodeVersionFailureNock(runtimeEnvironmentDef, 'get');

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .then(e => {
                var t = e;
            })
            .catch(e => {
                assert.isNotNull(e.validation.verifyB2CSites.error, 'error for verifyB2CSites should be seed -- as site retrieval failed');
            })
            .finally(() => done());
    });

    it('fails gracefully if code-version validation fails', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock(2);
        // eslint-disable-next-line no-unused-vars
        siteGetSuccessNock1 = getSiteDetailsGetSuccessNock(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[0].trim());
        // eslint-disable-next-line no-unused-vars
        siteGetSuccessNock2 = getSiteDetailsGetSuccessNock(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[1].trim());
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getCodeVersionFailureNock(runtimeEnvironmentDef, 'get');

        // Exercise the authentication and connection property validation process
        b2cVerify(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e.validation.verifyB2CCodeVersion.error, 'error for verifyB2CCodeVersion should be seeded -- as code-version retrieval failed'))
            .finally(() => done());
    });
});
