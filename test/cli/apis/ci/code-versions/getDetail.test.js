'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic network activity
const getCodeVersionSuccessNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');
const getInternalServerErrorNock = require('../../../../../lib/qa/nocks/b2c/ocapi/_internalServerError_FailureNock');

// Initialize test dependencies
const getCodeVersionDetail = require('../../../../../lib/apis/ci/code-versions/_getDetail');

describe('Retrieval of a Specific Code Version via OCAPI Data API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Configure the total number of retries supported per test
    // noinspection JSAccessibilityCheck
    this.retries(config.get('unitTests.testData.testRetryCount'));

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns a valid code version if the request processes successfully', function (done) {

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
        codeVersionSuccessNock = getCodeVersionSuccessNock(environmentDef, 'get');

        // Attempt to invoke the mock request and evaluate the result
        getCodeVersionDetail(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isObject(codeVersionResult, 'the verification result should be returned as an object');
                assert.isTrue(codeVersionResult.hasOwnProperty('data'), 'the code-version instance should have the property \'data\'');
                assert.isTrue(codeVersionResult.data.hasOwnProperty('_type'), 'the code-version instance should have the property \'data._type\'');
                assert.isTrue(codeVersionResult.data._type === 'code_version', 'the code-version instance should have a \'data._type\' property value of \'code_version\'');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('throws an error if the code version was not found', function (done) {

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
        codeVersionFailureNock = getInternalServerErrorNock(environmentDef, 'get');

        // Attempt to invoke the mock request and evaluate the result
        getCodeVersionDetail(environmentDef, authToken, undefined)
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown with this failure'))
            .finally(() => done());
    });
});
