'use strict';

// Initialize constants
const nock = require('nock');
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nock-definitions we use to mock http requests
const siteDetailsGetSuccessNock = require('../../../../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_SuccessNock');
const siteDetailsGetFailureNock = require('../../../../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_FailureNock');
const getInternalServerErrorNock = require('../../../../../../lib/qa/nocks/b2c/ocapi/_internalServerError_FailureNock');

// Initialize dependencies
const siteDetailsGet = require('../../../../../../lib/apis/sfcc/ocapi/data/_siteDetailsGet');
const requestLib = require('../../../../../../lib/_common/request');

describe('Retrieval of B2C Commerce Site details', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Configure the total number of retries supported per test
    // noinspection JSAccessibilityCheck
    this.retries(config.get('unitTests.testData.testRetryCount'));

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('processes predictably when a request is successfully executed', function (done) {
        // Initialize local variables
        let siteDetailSuccessNock,
            environmentDef,
            b2cRequestInstance,
            accessToken,
            siteId;

        // Default the accessToken used to authenticate
        accessToken = 'this-map-access-token';

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Abstract the siteId being used for testing
        siteId = environmentDef.b2cSiteIds[0];

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        siteDetailSuccessNock = siteDetailsGetSuccessNock(environmentDef, siteId);

        // Attempt to authenticate against B2C Commerce using the environment credentials
        b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

        // Attempt to retrieve the site-details
        siteDetailsGet(b2cRequestInstance, accessToken, siteId)
            .then(responseObj => {
                // Next, validate that the site details were successfully retrieved
                assert.isNotNull(responseObj, 'the response should be populated with a valid code version definition');
                assert.isTrue(responseObj.hasOwnProperty('status'), 'the response should have the http property \'status\'');
                assert.isTrue(responseObj.hasOwnProperty('data'), 'the response should have the http property \'data\'');
                assert.isTrue(responseObj.status === 200, 'the response should return a status code value of 200');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('fails gracefully when a request does not execute successfully', function (done) {
        // Initialize local variables
        let siteDetailFailureNock,
            environmentDef,
            b2cRequestInstance,
            accessToken,
            siteId;

        // Default the accessToken used to authenticate
        accessToken = 'this-map-access-token';

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));
        siteId = environmentDef.b2cSiteIds[0];

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        siteDetailFailureNock = siteDetailsGetFailureNock(environmentDef, siteId);

        // Attempt to authenticate against B2C Commerce using the environment credentials
        b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

        // Attempt to retrieve the site-details
        siteDetailsGet(b2cRequestInstance, accessToken, siteId)
            .then(responseObj => {
                // Next, validate that the site details were empty
                assert.isNotNull(responseObj, 'the response should be be seed with a summary of the captures response');

                // Audit the properties that we expect in the response summary
                assert.isTrue(responseObj.hasOwnProperty('status'), 'the response should have the http property \'status\'');
                assert.isTrue(responseObj.hasOwnProperty('data'), 'the response should have the http property \'data\'');
                assert.isTrue(responseObj.data.hasOwnProperty('fault'), 'the response should have the http property \'data.fault\'');
                assert.isTrue(responseObj.status !== 200, 'the response should return a status code not equal to 200');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('successfully throws an error on processed 500 responses', function (done) {
        // Initialize local variables
        let environmentDef,
            internalServerErrorNock,
            b2cRequestInstance,
            accessToken;

        // Default the accessToken used to authenticate
        accessToken = 'this-map-access-token';

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        internalServerErrorNock = getInternalServerErrorNock(environmentDef, 'get');

        // Attempt to authenticate against B2C Commerce using the environment credentials
        b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

        // Attempt to retrieve the site-details
        siteDetailsGet(b2cRequestInstance, accessToken)
            .catch(e => assert.isNotNull(e, 'verify an error object is returned by the service call-back'))
            .finally(() => done());
    });
});
