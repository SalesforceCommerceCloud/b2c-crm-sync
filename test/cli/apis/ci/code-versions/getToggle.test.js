'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic network activity
const getCodeVersionsSuccessNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersionsGet_SuccessNock');
const getCodeVersionsFailureNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersionsGet_FailureNock');

// Initialize test dependencies
const getToggleCodeVersion = require('../../../../../lib/apis/ci/code-versions/_getToggle');

describe('Identify a Code Version to Toggle via SFCC-CI', function () {

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns an object representing the toggle-able code version', function (done) {

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
        codeVersionSuccessNock = getCodeVersionsSuccessNock(environmentDef);

        // Disable network connections
        nock.disableNetConnect();

        // Attempt to invoke the mock request and evaluate the result
        getToggleCodeVersion(environmentDef, authToken, undefined)
            .then(codeVersionResult => {
                // Assert that the results are returned as a boolean value
                assert.isObject(codeVersionResult, 'the code-version result should be presented as an object');
                assert.isTrue(codeVersionResult.hasOwnProperty('_type'), 'the code-version result should include a type of \'code_version\'');
                assert.isTrue(codeVersionResult._type === 'code_version', 'the object-type for the response should be \'code_version\'');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('gracefully fails when an error occurs retrieving code versions', function (done) {

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
        codeVersionFailureNock = getCodeVersionsFailureNock(environmentDef);

        // Attempt to invoke the mock request and evaluate the result
        getToggleCodeVersion(environmentDef, authToken, undefined)
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown'))
            .finally(() => done());
    });
});
