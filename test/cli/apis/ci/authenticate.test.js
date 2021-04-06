'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic network activity
const getAMSuccessNockScope = require('../../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMFailureNockScope = require('../../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');

// Initialize test dependencies
const b2cAuthenticate = require('../../../../lib/apis/ci/_authenticate');

describe('Authentication via SFCC-CI', function () {

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('succeeds when valid credentials are provided', function (done) {

        // Initialize local variables
        let amSuccessNockScope,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        amSuccessNockScope = getAMSuccessNockScope();

        // Attempt to authenticate the mock request and evaluate the result
        b2cAuthenticate(environmentDef)
            .then(accessToken => assert.isTrue(accessToken.length > 0, 'expected a valid accessToken'))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('fails when invalid credentials are provided', function (done) {

        // Initialize local variables
        let amFailureNockScope,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        amFailureNockScope = getAMFailureNockScope();

        // Attempt to authenticate the mock request and evaluate the result
        b2cAuthenticate(environmentDef)
            .catch(e => assert.isNotNull(e, 'expected the error object to include exception details'))
            .finally(() => done());
    });
});
