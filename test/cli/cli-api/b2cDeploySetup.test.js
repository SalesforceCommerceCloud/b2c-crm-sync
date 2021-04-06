'use strict';

// Initialize the assertion library
const mock = require('mock-fs');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local test dependencies
const b2cDeploySetup = require('../../../lib/cli-api/_b2cDeploySetup');

// Exercise the retrieval of the operation mode
describe('Setup B2C Deployment Folders via the API', function () {
    // Restore the file-system after each unit-test
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    afterEach(function () { mock.restore(); });

    it('successfully creates the expected deployment folders', function (done) {
        // Initialize the mock file-system
        mock({ 'tmp/': {} }, { createCwd: false, createTmp: false });

        // Attempt to verify the temporary folder -- and disable the purge
        b2cDeploySetup()
            .then(setupResult => assert.isArray(setupResult, 'the setupResult object should be seeded with the deploy-setup details'))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });
});
