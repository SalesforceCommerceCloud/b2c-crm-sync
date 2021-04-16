'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

// Initialize local test dependencies
const sfdcContacts = require('../../../lib/qa/processes/_sfdcContacts');

// Exercise the retrieval of the operation mode
describe('The SFDC Contact REST APIs multi-cloud test methods', function () {
    // Set the timeout for this test
    this.timeout(10000);

    it('successfully process all SFDC Account and Contact REST API interactions', function () {
        // Initialize local variables
        let environmentDef,
            customerListId,
            output;

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();

        // Attempt to execute the collection of SFDC Contact test-methods
        sfdcContacts(environmentDef, customerListId)
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
                outputKeys.forEach(thisKey => assert.isTrue(output[thisKey].success === true, `${thisKey}.success is false; please inspect this API interaction`));
            });
    });
});
