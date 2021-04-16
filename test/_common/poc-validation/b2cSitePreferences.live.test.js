'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

// Initialize local test dependencies
const b2cSitePreferences = require('../../../lib/qa/processes/_b2cSitePreferences');

// Exercise the retrieval of the operation mode
describe('The B2C Commerce Site Preference REST APIs multi-cloud test methods', function () {
    it('successfully process all B2C Commerce site preference REST API interactions', function () {
        // Initialize local variables
        let environmentDef,
            customerListId,
            siteId,
            output;

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Attempt to manipulate B2C Commerce REST APIs
        b2cSitePreferences(environmentDef, siteId)
            // Seed the output object
            .then(responseObj => {
                output = responseObj;
            })
            .catch(errorObj => {
                output = errorObj;
            })
            .finally(() => {
                // Initialize local variables
                let outputKeys = Object.keys(output);

                // Evaluate that the base-status
                assert.isTrue(output.hasOwnProperty('baseStatus'),'baseStatus key should exist; please inspect the execution output');
                assert.isTrue(output.baseStatus.success,'baseStatus.success value should be true; please inspect the execution output');

                // Evaluate that each of the keys were processed successfully
                outputKeys.forEach(thisKey => assert.isTrue(output[thisKey].success === true, `${thisKey} is false; please inspect this API interaction`));
            });
    });
});
