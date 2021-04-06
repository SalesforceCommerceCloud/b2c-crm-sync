'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize dependencies
const getDeployPath = require('../../../../lib/_common/fs/_getDeployPath');

describe('Calculating the Deployment Path', function () {

    it('successfully calculates the deploy path for b2c cartridges', function () {

        // Initialize local variables
        let output;

        // Default the site / api-version to use
        output = getDeployPath('b2c', 'cartridges');

        // Validate that the generated url matches the expected result
        assert.isNotNull(output, 'expected a valid path to be generated');
        assert.isString(output, 'expected the deployPath to be calculated as a string');

    });

});
