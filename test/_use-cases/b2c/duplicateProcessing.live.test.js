'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');

// Initialize local libraries for SFDC
const sfdcAuth = require('../../../lib/apis/sfdc/auth');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const sfdcAccountContactPurge = require('../../../test/_common/processes/_sfdcAccountContactPurge');

// Exercise the retrieval of the operation mode
describe('Duplicate Contact record processing via Salesforce Platform REST APIs', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    this.timeout(30000);

    // Initialize local variables
    let environmentDef,
        testProfile,
        testContact,
        accountType,
        sfdcAuthCredentials;

    // Attempt to register the B2C Commerce Customer
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));

        // Create a shorthand reference to the type of account to process / create for this test
        accountType = environmentDef.sfScratchOrgProfile;

        // Initialize the testContact
        testContact = {
            Email: testProfile.customer.email,
            LastName: testProfile.customer.last_name,
            B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cCustomerList')
        };

        try {

            // Audit the authorization token for future rest requests
            sfdcAuthCredentials = await sfdcAuth.authUserCredentials(
                environmentDef.sfLoginUrl,
                environmentDef.sfUsername,
                environmentDef.sfPassword,
                environmentDef.sfSecurityToken);

            // Purge the Account / Contact contacts using the test user profile
            await sfdcAccountContactPurge(sfdcAuthCredentials.conn);

        } catch (e) {

            // Audit the error if one is thrown
            throw new Error(e);

        }

    });

    it('prevents duplicate Email and LastName records with no CustomerList mapping', async function () {

        // Initialize the output scope
        let contactObject,
            accountName,
            errorCaught;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email
        };

        // Default the accountName to leverage
        accountName = config.get('unitTests.testData.defaultAccountName').toString();

        try {

            // Execute the pre-test logic to seed the 1st pass at expected test data
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType, true);

            // Execute the pre-test logic to seed the 2nd expected test data (this is a duplicate)
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType, true);

        } catch (e) {

            // Audit than an error was caught
            errorCaught = e;

        }

        // Evaluate if an error was thrown
        assert.isTrue(errorCaught !== undefined, ' -- expected an error to be caught; please ensure that the Standard Contact Duplicate / Matching Rules are activated');

    });

    it('allows duplicate Email and LastName records with different customerList mappings', async function () {

        // Initialize the output scope
        let contactObject,
            accountName,
            errorCaught;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cSiteCustomerLists.RefArch').toString()
        };

        // Default the accountName to leverage
        accountName = 'Unknown Customer';

        try {

            // Execute the pre-test logic to seed the 1st pass at expected test data
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType, true);

            // Update the customerList and change it -- to make the
            contactObject.B2C_CustomerList_ID__c = config.get('unitTests.testData.b2cSiteCustomerLists.RefArchGlobal').toString();

            // Execute the pre-test logic to seed the 2nd expected test data (this is a duplicate)
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType, true);

        } catch (e) {

            // Audit than an error was caught
            errorCaught = e;

        }

        // Evaluate if an error was thrown
        assert.isTrue(errorCaught === undefined, ' -- expected no error to be caught; please check Match and Duplicate rules and try again');

    });

    it('does not allow the creation of a duplicate contact without specifying a customerList relationship', async function () {

        // Initialize the output scope
        let contactObject,
            accountName,
            errorCaught;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cSiteCustomerLists.RefArch').toString()
        };

        // Default the accountName to leverage
        accountName = config.get('unitTests.testData.defaultAccountName').toString();

        try {

            // Execute the pre-test logic to seed the 1st pass at expected test data
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType, true);

            // Update the customerList and change it -- to make the
            delete contactObject.B2C_CustomerList_ID__c;

            // Execute the pre-test logic to seed the 2nd expected test data (this is a duplicate with a different customerList)
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType, true);

        } catch (e) {

            // Audit than an error was caught
            errorCaught = e;

        }

        // Evaluate if an error was caught
        assert.isTrue(errorCaught !== undefined, ' -- expected an error to be caught; please ensure that the Standard Contact Duplicate / Matching Rules are activated');

    });

    it('supports the creation of multiple Contact records spanning multiple customerLists', async function () {

        // Initialize the output scope
        let contactObject,
            accountName,
            errorCaught;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cSiteCustomerLists.RefArch').toString()
        };

        // Default the accountName to leverage
        accountName = config.get('unitTests.testData.defaultAccountName').toString();

        try {

            // Execute the pre-test logic to seed the 1st pass at expected test data
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType);

            // Update the customerList and change it -- so that we create an record mapped to another customer list
            contactObject.B2C_CustomerList_ID__c = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch').toString();

            // Execute the pre-test logic to seed the 2nd expected test data (this is a duplicate)
            // These records should be treated separately -- as they represent different individual relationships
            await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, accountType);

        } catch (e) {

            // Audit than an error was caught
            errorCaught = e;

        }

        // Evaluate if an error was caught
        assert.isTrue(errorCaught === undefined, ' -- expected that no error is thrown; please ensure that the Standard Contact Duplicate / Matching Rules are activated');

    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Purge the Account / Contact contacts
        await sfdcAccountContactPurge(sfdcAuthCredentials.conn);

    });

});
