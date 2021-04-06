'use strict';

// Initialize the assertion library
const mock = require('mock-fs');
const fs = require('fs');
const assert = require('chai').assert;

// Initialize dependencies
const verifyAndCreateFolder = require('../../../../lib/_common/fs/_verifyAndCreateFolder');

describe('Verifying and Creating Deployment Folders', function () {

    // Restore the file-system after each unit-test
    afterEach(function () { mock.restore(); });

    it('successfully verifies the target directory in the file system', function () {

        // Initialize the mock file-system
        mock({ 'tmp/path': {} }, { createCwd: false, createTmp: false });

        // Attempt to verify the temporary folder -- and disable the purge
        verifyAndCreateFolder('tmp/path', true).then(output => {
            // Validate that the output generated is structured as expected
            assert.isNotNull(output, 'expected a object containing the path processing results');
            assert.isTrue(output.verified, 'expected the specified folder to be verified');
        });
    });

    it('successfully verifies and removes a directory with sub-directories', function () {

        // Initialize the mock file-system
        mock({ 'tmp/path/this/test/folder': {} }, { createCwd: false, createTmp: false });

        // Attempt to verify the temporary folder -- and disable the purge
        verifyAndCreateFolder('tmp/path').then(output => {
            // Check the file-system and see if the sub-folders exist
            const fsExists = fs.existsSync('tmp/path/this');

            // Validate that the output generated is structured as expected
            assert.isNotNull(output, 'expected a object containing the path processing results');
            assert.isTrue(output.verified, 'expected the specified folder to be verified');
            assert.isFalse(fsExists, 'did not expect the tmp/path/this folder to be recognized by the file-system');
        });

    });

    it('throws an error if a path to process is not defined', function () {

        // Initialize the mock file-system
        mock({ 'tmp/path/this/test/folder': {} }, { createCwd: false, createTmp: false });

        // Force an error to be thrown by omitting the path to process
        verifyAndCreateFolder(undefined).catch(output => {
            // Validate that an error was included in the output results
            assert.isNotNull(output.error, 'expected an error to be caught and returned');
        });
    });

});
