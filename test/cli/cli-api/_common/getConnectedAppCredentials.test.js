'use strict';

// Initialize constants
const config = require('config');
const assert = require('chai').assert;

// Initialize the assertion library
const mock = require('mock-fs');

// Initialize dependencies
const _getConnectedAppCredentials = require('../../../../lib/cli-api/_common/_getConnectedAppCredentials');

describe('Get ConnectedApp Credentials', function () {

    // Restore the file-system after each unit-test
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    afterEach(function () { mock.restore(); });

    it('returns the value of te parsed .json file -- if it exists', function () {

        // Initialize local variables
        let output,
            configOptions,
            configFileName;

        // Default the configuration path and fileName
        configFileName = config.get('paths.connectedAppFileName').toString();

        configOptions = {
            configFileName: {}
        };

        // Initialize the configuration options
        configOptions[configFileName] = mock.file({
            content: '{ "isJSON": true }'
        });

        // Initialize the mock file-system
        mock({
            'tmp': configOptions
        }, { createCwd: true, createTmp: true });

        // Attempt to read-in the configuration file
        output = _getConnectedAppCredentials('tmp/');

        // Validate that the configuration file is successfully read
        assert.isTrue(output.isJSON, `-- unable to read ${configFileName}; expected isJSON=true`);

    });

});
