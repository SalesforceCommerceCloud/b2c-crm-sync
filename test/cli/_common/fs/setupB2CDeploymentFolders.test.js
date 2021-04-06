'use strict';

// Initialize the assertion library
const mock = require('mock-fs');
const fs = require('fs');
const assert = require('chai').assert;

// Initialize dependencies
const setupB2CDeploymentFolders = require('../../../../lib/_common/fs/_setupB2CDeploymentFolders');

describe('Setting-Up the B2C Deployment Folders', function () {

    // Restore the file-system after each unit-test
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    afterEach(function () { mock.restore(); });

    it('successfully creates the expected deployment folders', function () {

        // Initialize the mock file-system
        mock({ 'tmp/': {} }, { createCwd: false, createTmp: false });

        // Initialize local variables
        let output,
            thisTestResult;

        // Attempt to verify the temporary folder -- and disable the purge
        output = setupB2CDeploymentFolders();

        // Validate that the output generated is structured as expected
        assert.isNotNull(output, 'expected a object containing the path processing results');

        // Loop over the test results
        for (let pathIndex = 0; pathIndex < output.length; pathIndex++) {

            // Create a reference to the current path
            thisTestResult = output[pathIndex];

            // Validate that each path was created via the mock file-system
            assert.isTrue(fs.existsSync(thisTestResult.path), `expected to confirm that ${thisTestResult.path} was created`);

        }

    });

});
