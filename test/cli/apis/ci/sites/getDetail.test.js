'use strict';

// Initialize constants
const config = require('config');
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic network activity
const getSiteDetailSuccessNock = require('../../../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_SuccessNock');
const getInternalServerErrorNock = require('../../../../../lib/qa/nocks/b2c/ocapi/_internalServerError_FailureNock');

// Initialize test dependencies
const getSiteDetail = require('../../../../../lib/apis/ci/sites/_getDetail');

describe('Retrieval of a Specific Site via the OCAPI Data API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Configure the total number of retries supported per test
    // noinspection JSAccessibilityCheck
    this.retries(config.get('unitTests.testData.testRetryCount'));

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns a valid site-detail if the request processes successfully', function (done) {

        // Initialize local variables
        let codeVersionSuccessNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Default the authToken to use in the mimicked request
        authToken = 'site-get-auth-token';

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionSuccessNock = getSiteDetailSuccessNock(environmentDef, 'get');

        // Attempt to invoke the mock request and evaluate the result
        getSiteDetail(environmentDef, authToken, environmentDef.b2cSiteIds[0])
            .then(siteDetailResult => {
                // Assert that the results are returned as a boolean value
                assert.isObject(siteDetailResult, 'the verification result should be returned as an object');
                assert.isTrue(siteDetailResult.hasOwnProperty('data'), 'the code-version instance should have the property \'data\'');
                assert.isTrue(siteDetailResult.data.hasOwnProperty('_type'), 'the code-version instance should have the property \'data._type\'');
                assert.isTrue(siteDetailResult.data._type === 'site', 'the code-version instance should have a \'data._type\' property value of \'site\'');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('throws an error if the site-detail was not found', function (done) {

        // Initialize local variables
        let codeVersionFailureNock,
            authToken,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Default the authToken to use in the mimicked request
        authToken = 'site-get-auth-token';

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionFailureNock = getInternalServerErrorNock(environmentDef, 'get');

        // Attempt to invoke the mock request and evaluate the result
        getSiteDetail(environmentDef, authToken, environmentDef.b2cSiteIds[0])
            .catch(e => assert.isNotNull(e, 'expected an error to be thrown with this failure'))
            .finally(() => done());
    });
});
