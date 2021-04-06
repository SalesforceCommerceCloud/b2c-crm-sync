'use strict';

// Initialize constants
const nock = require('nock');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the nock reset-helper
const resetNocks = require('../../../lib/qa/nocks/_resetNocks');

// Initialize local test dependencies
const verifyB2CSites = require('../../../lib/cli-api/_b2cSitesVerify');
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Retrieve the nocks used to mock Account Manager external API requests
const getAMAuthSuccessNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_SuccessNock');
const getAMAuthFailureNock = require('../../../lib/qa/nocks/b2c/am/_getAMAuth_FailureNock');

// Retrieve the nocks used to mock B2C Commerce OCAPI external API requests
const siteDetailsGetSuccessNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_SuccessNock');
const siteDetailsGetFailureNock = require('../../../lib/qa/nocks/b2c/ocapi/data/_siteDetailsGet_FailureNock');

/**
 * @private
 * @function _buildOCAPINocks
 * @description Helper function to create site-specific nocks designed to intercept the
 * OCAPI https requests used to retrieve site details from the B2C Commerce instance
 *
 * @param {Object} runtimeEnvironment Describes the B2C Commerce environment being addressed
 * @return {Array} Returns an array with a nock for each site defined in the environment configuration
 */
function _buildOCAPINocks(runtimeEnvironment) {

    // Initialize local variables
    let output,
        thisSite,
        thisNock;

    // Initialize the output variable
    output = [];

    // Loop over the collection of sites in the runtime environment
    for (let siteIndex = 0; siteIndex < runtimeEnvironment.b2cSiteIds.length; siteIndex++) {

        // Create a reference to the current site
        thisSite = runtimeEnvironment.b2cSiteIds[siteIndex];

        // Does the site have an invalid prefix?
        if (thisSite.indexOf('Invalid') !== -1) {

            // Build the nock definition representing the API failure
            thisNock = siteDetailsGetFailureNock(runtimeEnvironment, thisSite);

        } else {

            // Build the nock definition for the current site
            thisNock = siteDetailsGetSuccessNock(runtimeEnvironment, thisSite);

        }

        // Add the nock to the collection of mocked-requests
        output.push(thisNock);

    }

    // Return the collection of nocks
    return output;

}

// Exercise the retrieval of the operation mode
describe('Verify B2C Commerce Sites via the API', function () {

    // Create an instance of the mock command object
    let AMAuthSuccessNock,
        AMAuthFailureNock,
        b2cOCAPINocks,
        commandObj,
        runtimeEnvironmentDef;

    // Clear out the nock interceptors before each test is executed
    beforeEach(function (done) { resetNocks(nock, done); });

    it('returns a successful validation result for configured site identifiers', function (done) {
        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        AMAuthSuccessNock = getAMAuthSuccessNock();

        // Define the nock interceptors for the OCAPI Data Site get-requests
        b2cOCAPINocks = _buildOCAPINocks(runtimeEnvironmentDef);

        verifyB2CSites(runtimeEnvironmentDef)
            .then(resultObj => assert.hasAllKeys({ b2cConnProperties: true, b2cSiteProperties: true, environmentDetails: true, apiCalls: true, validationSummary: true }, resultObj))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('fails if the required b2c environment properties are not configured correctly', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.missingHostName');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        verifyB2CSites(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as the configuration is missing the b2cHostName'))
            .finally(() => done());
    });
    it('includes site-specific failures for valid configurations', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.invalidSite');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        AMAuthSuccessNock = getAMAuthSuccessNock();

        // Define the nock interceptors for the OCAPI Data Site get-requests
        b2cOCAPINocks = _buildOCAPINocks(runtimeEnvironmentDef);

        verifyB2CSites(runtimeEnvironmentDef)
            .then(resultObj => assert.hasAllKeys({ b2cConnProperties: true, b2cSiteProperties: true, environmentDetails: true, apiCalls: true, validationSummary: true }, resultObj))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });
    it('fails gracefully if all sites are invalid for valid configurations', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock('unitTests.opts.invalidSites');

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthSuccessNock = getAMAuthSuccessNock();

        // Define the nock interceptors for the OCAPI Data Site get-requests
        // eslint-disable-next-line no-unused-vars
        b2cOCAPINocks = _buildOCAPINocks(runtimeEnvironmentDef);

        verifyB2CSites(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should not be null if all sites fail remove validation'))
            .finally(() => done());
    });

    it('fails if B2C Commerce authentication fails', function (done) {

        // Initialize the command object
        commandObj = new CommandObjMock();

        // Retrieve the runtime environment mimicking the CLI
        runtimeEnvironmentDef = getRuntimeEnvironment(commandObj.opts());

        // Define the nock interceptor for the authentication request
        // eslint-disable-next-line no-unused-vars
        AMAuthFailureNock = getAMAuthFailureNock();

        verifyB2CSites(runtimeEnvironmentDef)
            .catch(e => assert.isNotNull(e, 'errorObj should be seeded as the authentication should have failed'))
            .finally(() => done());
    });
});
