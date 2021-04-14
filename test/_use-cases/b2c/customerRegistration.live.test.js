'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');

// Initialize local libraries for SFDC
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

// Exercise the retrieval of the operation mode
describe('Registering a B2C Commerce Customer Profile with B2C-CRM-Sync enabled', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    this.timeout(30000);

    // Initialize local variables
    let environmentDef,
        initResults,
        testProfile,
        accountType,
        customerListId,
        siteId,
        b2cAdminAuthToken,
        sfdcAuthCredentials,
        registeredB2CCustomerNo;

    // Attempt to register the B2C Commerce Customer
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Create a reference to the accountType being processed
        accountType = environmentDef.sfScratchOrgProfile;

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));

        try {

            // Initialize the use-case test scenario (setup authTokens and purge legacy test-data)
            initResults = await useCaseProcesses.initUseCaseTests(environmentDef, siteId);

            // Shorthand the B2C administrative authToken
            b2cAdminAuthToken = initResults.multiCloudInitResults.b2cAdminAuthToken;

            // Audit the authorization token for future rest requests
            sfdcAuthCredentials = initResults.multiCloudInitResults.sfdcAuthCredentials;

        } catch (e) {

            // Audit the error if one is thrown
            throw new Error(e);

        }
    });

    it('successfully creates a B2C Commerce Customer Profile and a mapped SFDC Account / Contact', async function () {

        // Initialize local variables
        let output = {};

        // Ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Exercise the simplest version of the registration sub-test
        output.testResults = await registrationSubTest(environmentDef, b2cAdminAuthToken, sfdcAuthCredentials, siteId, testProfile);
        registeredB2CCustomerNo = output.testResults.registeredB2CCustomerNo;

    });

    it('successfully maps a B2C Commerce Profile to an Account / Contact by Email and LastName with no B2C CustomerList', async function () {

        // Initialize the output scope
        let output = {};

        // Ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Create the seed accountContact relationship
        output.accountContactCreateResults = await useCaseProcesses.sfdcAccountContactCreate(
            sfdcAuthCredentials, {
                FirstName: testProfile.customer.first_name,
                LastName: testProfile.customer.last_name,
                Email: testProfile.customer.email
            }, config.get('unitTests.testData.defaultAccountName'), accountType);

        // Exercise the simplest version of the registration sub-test
        output.testResults = await registrationSubTest(environmentDef, b2cAdminAuthToken, sfdcAuthCredentials, siteId, testProfile);
        registeredB2CCustomerNo = output.testResults.registeredB2CCustomerNo;

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactGetResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.testResults.b2cRegResults.response.data.c_b2ccrm_contactId);

        // Validate that the registration is well-formed and contains the key properties we expect
        validateRegisteredUserAndContactResults(output.testResults.b2cRegResults, output.sfdcContactGetResults);

        // Validate that the contact retrieval results match the creation results
        assert.equal(output.sfdcContactGetResults.Id, output.accountContactCreateResults.contactId, ' -- SFDC and B2C ContactID attributes do not match with the original Contact record (contactCreateResult)');

    });

    it('successfully maps a B2C Commerce Profile to an Account / Contact by CustomerList, Email, and Default LastName', async function () {

        // Initialize the output scope
        let output = {};

        // Create the seed accountContact relationship
        output.accountContactCreateResults = await useCaseProcesses.sfdcAccountContactCreate(
            sfdcAuthCredentials, {
                FirstName: testProfile.customer.first_name,
                LastName: testProfile.customer.last_name,
                Email: testProfile.customer.email,
                B2C_CustomerList_ID__c: customerListId
            }, config.get('unitTests.testData.defaultAccountName'), accountType);

        // Attempt to register a B2C Commerce customer
        output.b2cRegResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);
        registeredB2CCustomerNo = output.b2cRegResults.registeredB2CCustomerNo;

        // Validate that the registration is well-formed and contains the key properties we expect
        validateRegisteredUser(output.b2cRegResults);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactGetResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegResults.response.data.c_b2ccrm_contactId);

        // Validate that the registration is well-formed and contains the key properties we expect
        validateRegisteredUserAndContactResults(output.b2cRegResults, output.sfdcContactGetResults);

        // Validate that the email address and customerId attributes is aligned across both records
        assert.equal(output.sfdcContactGetResults.B2C_Customer_ID__c, output.b2cRegResults.response.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
        assert.equal(output.sfdcContactGetResults.Email, output.b2cRegResults.response.data.email, ' -- SFDC and B2C Email Addresses attributes do not match');

    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Purge the customer data in B2C Commerce and SFDC
        await useCaseProcesses.b2cCustomerPurgeByCustomerNo(b2cAdminAuthToken, sfdcAuthCredentials.conn, registeredB2CCustomerNo);

        // Ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncDisable(environmentDef, b2cAdminAuthToken, siteId);

    });

    // Reset the output variable in-between tests
    after(async function () {

        // Purge the customer data in B2C Commerce and SFDC
        await useCaseProcesses.b2cCustomerPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

    });

});

/**
 * @function registrationSubTest
 * @description This is a helper function that consolidates the repetitive logic used to exercise
 * different multi-cloud registration scenarios.
 *
 * @param environmentDef (Object) Represents the local environment being exercised
 * @param b2cAdminAuthToken (String) Represents the B2C Administrator authToken
 * @param sfdcAuthCredentials (connection) Represents the SFDC credentials leveraged during testing
 * @param siteId (String) Represents the site / storefront that is being enabled for test integration
 * @param testProfile (String) Represents the test profile used to exercise registration unit-tests
 */
async function registrationSubTest(environmentDef, b2cAdminAuthToken, sfdcAuthCredentials, siteId, testProfile) {

    // Initialize local Variables
    let output = {};

    // Attempt to register a B2C Commerce customer
    output.b2cRegResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);
    output.registeredB2CCustomerNo = output.b2cRegResults.registeredB2CCustomerNo;

    // Validate that the registration is well-formed and contains the key properties we expect
    validateRegisteredUser(output.b2cRegResults);

    // Retrieve the contact details from the SFDC environment
    output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
        'Contact', output.b2cRegResults.response.data.c_b2ccrm_contactId);

    // Validate that the registration is well-formed and contains the key properties we expect
    validateRegisteredUserAndContactResults(output.b2cRegResults, output.sfdcContactResults);

    // Return the output variable
    return output;

}

/**
 * @function validateRegisteredUser
 * @description Helper function to centralize validation / assertion logic for test-scenarios
 *
 * @param {Object} b2cRegResults Represents the registration results for a given unit-test being evaluated
 */
function validateRegisteredUser(b2cRegResults) {

    // Validate that the registration is well-formed and contains the key properties we expect
    assert.equal(b2cRegResults.response.status, 200, ' -- expected a 200 status code from B2C Commerce');
    assert.isTrue(b2cRegResults.response.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
    assert.equal(b2cRegResults.response.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
    assert.isTrue(b2cRegResults.response.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
    assert.isTrue(b2cRegResults.response.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

}

/**
 * @function validateRegisteredUserAndContactResults
 * @description Helper function to centralize validation / assertion logic for test-scenarios
 *
 * @param {Object} b2cRegResults Represents the registration results for a given unit-test being evaluated
 * @param {Object} sfdcContactResults Represents the contact creation results for a given unit-test being evaluated
 */
function validateRegisteredUserAndContactResults(b2cRegResults, sfdcContactResults) {

    // Validate that the SFDC Contact record exists and contains key properties
    assert.equal(sfdcContactResults.success, true, ' -- expected the success flag to have a value of true');
    assert.isTrue(sfdcContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
    assert.equal(sfdcContactResults.Id, b2cRegResults.response.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
    assert.equal(sfdcContactResults.AccountId, b2cRegResults.response.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

    // Validate that the email address and customerId attributes is aligned across both records
    assert.equal(sfdcContactResults.B2C_Customer_ID__c, b2cRegResults.response.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
    assert.equal(sfdcContactResults.Email, b2cRegResults.response.data.email, ' -- SFDC and B2C Email Addresses attributes do not match');

}
