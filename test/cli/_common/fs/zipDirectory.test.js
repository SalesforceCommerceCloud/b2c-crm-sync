'use strict';

// Initialize the assertion library
const mock = require('mock-fs');
const assert = require('chai').assert;

// Initialize dependencies
const zipDirectory = require('../../../../lib/_common/fs/_zipDirectory');

describe('Zipping / Archiving a Specific Directory', function () {

    // Restore the file-system after each unit-test
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    afterEach(function () { mock.restore(); });

    it('successfully generates an archive from a source directory', function (done) {

        // Initialize the mock file-system
        mock({
            'tmp/target': {},
            'tmp/source': {
                'test-file1.txt': 'example-filecontent',
                'empty-dir': {}
            }
        }, { createCwd: false, createTmp: false });

        // Attempt to verify the temporary folder -- and disable the purge
        zipDirectory('tmp/source', 'tmp/target/archive.zip')
            .then(zipResponse => {
                // Validate that the output generated is structured as expected
                assert.isTrue(zipResponse, 'expected a boolean value explaining that archive was created');
                // Close out the function
                done();
            });

    });

    it('successfully returns an error if any issues occur when creating the zip-archive', function (done) {

        // Initialize the mock file-system
        mock({
            'tmp/target': {},
            'tmp/source': {
                'test-file1.txt': 'example-filecontent',
                'empty-dir': {}
            }
        }, { createCwd: false, createTmp: false });

        // Attempt to verify the temporary folder -- and disable the purge
        zipDirectory('tmp/source-missing', 'tmp/target/a')
            .catch(err => {
                assert.isNotNull(err, 'expected an error to be thrown during the archiving attempt');
                done();
            });

    });

});
