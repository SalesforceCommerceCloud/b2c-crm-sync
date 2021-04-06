'use strict';

// Initialize the assertion library
const config = require('config');
const mock = require('mock-fs');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local test dependencies
const b2cZip = require('../../../lib/cli-api/_b2cZip');
const CommandObjMock = require('../../../lib/qa/util/_commandObjMock');

// Exercise the retrieval of the operation mode
describe('Zip B2C Data and Cartridge Folders via the API', function () {
    // Restore the file-system after each unit-test
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    afterEach(function () { mock.restore(); });

    it('successfully zips b2c cartridge content', function (done) {
        // Initialize local variables
        let commandObj;

        // Initialize the mock file-system
        mock({
            src: {
                sfcc: {
                    cartridges: {
                        int_b2ccrmsync: {
                            'test-file1.txt': 'example-filecontent'
                        },
                        plugin_b2ccrmsync: {
                            'test-file1.txt': 'example-filecontent'
                        }
                    }
                }
            }
        }, { createCwd: false, createTmp: false });

        // Initialize the command object
        commandObj = new CommandObjMock();

        b2cZip(commandObj.opts(), config.get('paths.b2cLabel'), config.get('paths.cartridgePathLabel'))
            .then(zipResult => {
                // Confirm that the function processed as expected (not throwing errors)
                assert.isObject(zipResult, 'the setupResult object should be seeded with the deploy-setup details');
                assert.isTrue(zipResult.isValid, 'expected the zip process to complete successfully');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });

    it('successfully zips b2c data content', function (done) {

        // Initialize local variables
        let commandObj;

        // Initialize the mock file-system
        mock({
            src: {
                sfcc: {
                    'meta-data': {
                        'b2ccrmsync-metadata': {
                            'b2ccrmsync-metadata': {
                                'test-file1.txt': 'example-filecontent'
                            }
                        }
                    }
                }
            }
        }, { createCwd: false, createTmp: false });

        // Initialize the command object
        commandObj = new CommandObjMock();

        b2cZip(commandObj.opts(), config.get('paths.b2cLabel'), config.get('paths.metadataPathLabel'))
            .then(zipResult => {
                // Confirm that the function processed as expected (not throwing errors)
                assert.isObject(zipResult, 'the setupResult object should be seeded with the deploy-setup details');
                assert.isTrue(zipResult.isValid, 'expected the zip process to complete successfully');
            })
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => done());
    });
});
