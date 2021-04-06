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
const getAllCodeVersions = require('../../../../../lib/apis/ci/code-versions/_getAll');

describe('Code Version Retrieval via SFCC-CI', function () {
    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns an array representing retrieved code versions', function (done) {
        // Initialize local variables
        let codeVersionSuccessNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Default the authToken to use in the mimicked request
        authToken = 'code-version-get-auth-token';

        // Define the nock interceptor for the code-retrieval request
        // eslint-disable-next-line no-unused-vars
        codeVersionSuccessNock = getCodeVersionsSuccessNock(environmentDef);

        // Disable network connections
        nock.disableNetConnect();

        // Attempt to invoke the mock request and evaluate the result
        getAllCodeVersions(environmentDef, authToken, undefined)
            .then(codeVersionResults => {
                // Next, assert that the results are returned in an array
                assert.isArray(codeVersionResults.data, 'the code-version results should be presented as an array');
                // Validate that each of the code-versions are well formed
                codeVersionResults.data.forEach(function (thisCodeVersion) {
                    // Validate that each of the code versions are typed correctly
                    assert.isTrue(thisCodeVersion.hasOwnProperty('_type'), 'the code-version instances should have the property \'_type\'');
                    assert.isTrue(thisCodeVersion._type === 'code_version', 'the code-version instances should have a \'_type\' property value of \'code_version\'');
                });
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

        // Define the nock interceptor for the code-retrieval request
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getCodeVersionsFailureNock(environmentDef);

        // Disable network connections
        nock.disableNetConnect();

        // Attempt to invoke the mock request and evaluate the result
        getAllCodeVersions(environmentDef, authToken, undefined)
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown'))
            .finally(() => done());
    });
});
