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
const getActiveCodeVersions = require('../../../../../lib/apis/ci/code-versions/_getActive');

describe('Active Code Version Retrieval via SFCC-CI', function () {

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns the active code version for the configured B2C Commerce environment', function (done) {

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
        getActiveCodeVersions(environmentDef, authToken, undefined)
            .then(activeCodeVersion => {
                // Assert that the results are returned as a boolean value
                assert.isObject(activeCodeVersion, 'the code-version results should be presented as an object');
                assert.isTrue(activeCodeVersion.hasOwnProperty('activation_time'), 'the code-version results should have the property \'activation_time\'');
                assert.isTrue(activeCodeVersion.hasOwnProperty('active'), 'the code-version results should have the property \'active\'');
                assert.isTrue(activeCodeVersion.active === true, 'the code-version\'s active property should be set to true');
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

        // Disable network connections
        nock.disableNetConnect();

        // Attempt to invoke the mock request and evaluate the result
        getActiveCodeVersions(environmentDef, authToken, undefined)
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });
});
