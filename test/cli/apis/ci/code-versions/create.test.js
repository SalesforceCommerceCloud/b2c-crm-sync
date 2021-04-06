'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic network activity
const getCodeVersionPutSuccessNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');
const getCodeVersionPutFailureNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_FailureNock');
const getInternalServerErrorNock = require('../../../../../lib/qa/nocks/b2c/ocapi/_internalServerError_FailureNock');

// Initialize test dependencies
const createCodeVersion = require('../../../../../lib/apis/ci/code-versions/_create');

describe('Creating a Specific Code Version via the CLI', function () {
    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns true if the code-version was created', function (done) {
        // Initialize local variables
        let codeVersionSuccessNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Default the authToken to use in the mimicked request
        authToken = 'code-version-get-auth-token';

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionSuccessNock = getCodeVersionPutSuccessNock(environmentDef, 'put');

        // Attempt to invoke the mock request and evaluate the result
        createCodeVersion(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isBoolean(codeVersionResult, 'the verification result should be returned as a boolean');
                assert.isTrue(codeVersionResult, 'the verification result should return a value of true');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());

    });

    it('returns false if the code-version was not created', function (done) {
        // Initialize local variables
        let codeVersionFailureNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Default the authToken to use in the mimicked request
        authToken = 'code-version-get-auth-token';

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getCodeVersionPutFailureNock(environmentDef, 'put');

        // Attempt to invoke the mock request and evaluate the result
        createCodeVersion(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isBoolean(codeVersionResult, 'the verification result should be returned as a boolean');
                assert.isFalse(codeVersionResult, 'the verification result should return a value of false');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('gracefully fails when an error occurs creating a code version', function (done) {

        // Initialize local variables
        let codeVersionFailureNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Default the authToken to use in the mimicked request
        authToken = 'code-version-get-auth-token';

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getInternalServerErrorNock(environmentDef, 'put');

        // Attempt to invoke the mock request and evaluate the result
        createCodeVersion(environmentDef, authToken, undefined)
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown'))
            .finally(() => done());
    });
});
