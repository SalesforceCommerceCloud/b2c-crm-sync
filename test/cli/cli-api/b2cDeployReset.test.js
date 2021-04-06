'use strict';

// Initialize the assertion library
const config = require('config');
const mock = require('mock-fs');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local test dependencies
const b2cDeployReset = require('../../../lib/cli-api/_b2cDeployReset');

// Exercise the retrieval of the operation mode
describe('Reset B2C Deployment Folders via the API', function () {
    // Restore the file-system after each unit-test
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    afterEach(function () { mock.restore(); });

    it('successfully creates the expected deployment folder', function (done) {
        // Initialize the mock file-system
        mock({ 'tmp/': {} }, { createCwd: false, createTmp: false });

        // Attempt to reset the specified folder
        b2cDeployReset(config.get('paths.b2cLabel'), config.get('paths.cartridgePathLabel'))
            .then(setupResult => assert.isObject(setupResult, 'the setupResult object should be seeded with the deploy-setup details'))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('successfully captures any errors thrown during processing', function (done) {
        // Initialize the mock file-system
        mock({ 'tmp/': {} }, { createCwd: false, createTmp: false });

        // Attempt to reset the specified folder
        b2cDeployReset(config.get('paths.b2cLabel'), config.get('paths.cartridgePathLabel'))
            .catch(e => assert.isNotNull(e, 'the error object should be seeded as the path-element was unknown'))
            .finally(() => done());
    });
});
