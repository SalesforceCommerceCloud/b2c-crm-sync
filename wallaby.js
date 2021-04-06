'use strict';

// Initialize the development environment for unit tests
process.env.NODE_ENV = 'development';

// Initialize the Wallaby configuration
module.exports = function() {

    return {

        // Manage runtime execution
        debug: false,
        trace: false,

        // Default the desired code-coverage level
        lowCoverageThreshold: 90,

        // Define the files processed by Wallaby
        files: [
            '!wallaby.js',
            'config/**',
            'lib/**/*.js',
            '!test/**/*.test.js'
        ],

        // Define the tests to process
        tests: [
            'test/**/*.test.js',
            '!test/cli-interface/**/*.cli.test.js',
        ],

        // Define the files that shouldn't be used to calculate test coverage
        filesWithNoCoverageCalculated: [
            'lib/**/index.js',
            'lib/qa/**/*.js',
            'lib/cli-interface/ui/*.js',
            'lib/cli-interface/*.js'
        ],

        // Identify the test-framework to leverage
        testFramework: { type: 'mocha' },

        // Define the node environment
        env: {
            type: 'node',
            runner: 'node'
        },

        // Restart test workers with each test-run
        workers: {
            recycle: true,
            initial: 1,
            regular: 1
        }

    }

}
