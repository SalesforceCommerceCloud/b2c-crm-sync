'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic network activity
const getCodeVersionPatchSuccessNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');
const getCodeVersionPatchFailureNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_FailureNock');

// Initialize test dependencies
const activateCodeVersion = require('../../../../../lib/apis/ci/code-versions/_activate');

describe('Activating a specific Code Version via SFCC-CI', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Configure the total number of retries supported per test
    // noinspection JSAccessibilityCheck
    this.retries(config.get('unitTests.testData.testRetryCount'));

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns true if the code-version was activated', function (done) {
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
        codeVersionSuccessNock = getCodeVersionPatchSuccessNock(environmentDef, 'patch');

        activateCodeVersion(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isBoolean(codeVersionResult, 'the verification result should be returned as a boolean');
                assert.isTrue(codeVersionResult, 'the verification result should be returned with a value of true');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('returns false if the code-version was not activated', function (done) {
        // Initialize local variables
        let codeVersionFailureNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.missingCodeVersion'));

        // Default the authToken to use in the mimicked request
        authToken = 'code-version-get-auth-token';

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getCodeVersionPatchFailureNock(environmentDef, 'patch');

        activateCodeVersion(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isBoolean(codeVersionResult, 'the verification result should be returned as a boolean');
                assert.isFalse(codeVersionResult, `the code version ${environmentDef.b2cCodeVersion} should not be in the nock response`);
            })
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown'))
            .finally(() => done());
    });

    it('gracefully fails when an error occurs activating a code version', function (done) {
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
        codeVersionFailureNock = getCodeVersionPatchFailureNock(environmentDef, 'patch');

        activateCodeVersion(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isBoolean(codeVersionResult, 'the verification result should be returned as a boolean');
                assert.isFalse(codeVersionResult, 'the verification result should be returned with a value of false');
            })
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown'))
            .finally(() => done());
    });
});
