'use strict';

// Initialize constants
const nock = require('nock');
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const b2cAuthAsGuest = require('../../../../../lib/apis/sfcc/ocapi/shop/_authAsGuest');
const getRuntimeEnvironment = require('../../../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getGuestAuthSuccessNock = require('../../../../../lib/qa/nocks/b2c/ocapi/shop/_getGuestAuth_SuccessNock');
const getGuestAuthFailureNock = require('../../../../../lib/qa/nocks/b2c/ocapi/shop/_getGuestAuth_FailureNock');

// Exercise the retrieval of the operation mode
describe('Authentication Against a B2C Commerce Site as a Guest via the Shop API', function () {

    // Create an instance of the mock command object
    let guestAuthSuccessNock,
        guestAuthFailureNock,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('successfully returns a guest-user auth token for the B2C Commerce environment', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        guestAuthSuccessNock = getGuestAuthSuccessNock();

        // Exercise the authentication process for a guest user
        b2cAuthAsGuest(runtimeEnvironmentDef, runtimeEnvironmentDef.b2cSiteIds[0])
        .then(resultObj => {assert.hasAllKeys({ auth_type: true, customer_id: true, _type: true }, resultObj);})
        .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
        .finally(() => done());

    });

    it('throws an error on an invalid or unknown site-reference in the guest-auth request', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the REST API requests
        // eslint-disable-next-line no-unused-vars
        guestAuthFailureNock = getGuestAuthFailureNock();

        // Exercise the authentication process for a guest user
        b2cAuthAsGuest(runtimeEnvironmentDef, config.get('nockProperties.b2c.ocapi.invalidSiteId').toString())
        .then(resultObj => assert.hasAllKeys({ fault: true }, resultObj))
        .catch(e => assert.isNull(e, 'expected an error to be thrown'))
        .finally(() => done());

    });

});
