'use strict';

// Initialize constants
const nock = require('nock');
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../../lib/qa/nocks/_resetNocks');

// Initialize the nocks used to mimic http-requests
const getCodeVersionSuccessNock = require('../../../../../../lib/qa/nocks/b2c/ocapi/data/_codeVersion_SuccessNock');
const getInternalServerErrorNock = require('../../../../../../lib/qa/nocks/b2c/ocapi/_internalServerError_FailureNock');

// Initialize dependencies
const codeVersionGet = require('../../../../../../lib/apis/sfcc/ocapi/data/_codeVersionGet');
const requestLib = require('../../../../../../lib/_common/request');

describe('Retrieval of a B2C Commerce Code Version', function () {

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

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
        internalServerErrorNock = getInternalServerErrorNock(environmentDef);

        // Attempt to authenticate against B2C Commerce using the environment credentials
        b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

        // Attempt to create the code-version leveraging the B2C Commerce OCAPI data api
        codeVersionGet(b2cRequestInstance, accessToken, environmentDef.b2cCodeVersion)
            .catch(e => assert.isNotNull(e, 'verify an error object is returned by the service call-back'))
            .finally(() => done());
    });

    it('successfully retrieves the specified code-version', function (done) {

        // Initialize local variables
        let environmentDef,
            codeVersionSuccessNock,
            b2cRequestInstance,
            accessToken;

        // Default the accessToken used to authenticate
        accessToken = 'this-map-access-token';

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Define the nock interceptor for the http request
        // eslint-disable-next-line no-unused-vars
        codeVersionSuccessNock = getCodeVersionSuccessNock(environmentDef);

        // Attempt to authenticate against B2C Commerce using the environment credentials
        b2cRequestInstance = requestLib.createRequestInstance(environmentDef);

        // Attempt to create the code-version leveraging the B2C Commerce OCAPI data api
        codeVersionGet(b2cRequestInstance, accessToken, environmentDef.b2cCodeVersion)
            .then(responseObj => {
                // Next, validate that the site details were successfully retrieved
                assert.isNotNull(responseObj, 'the response should be populated with a valid code version definition');
                assert.isTrue(responseObj.hasOwnProperty('status'), 'the response should have the http property \'status\'');
                assert.isTrue(responseObj.hasOwnProperty('data'), 'the response should have the http property \'data\'');
                assert.isTrue(responseObj.status === 200, 'the response should return a status code value of 200');
            })
            .catch(e => assert.isNull(e, 'no error object should be raised'))
            .finally(() => done());
    });
});
