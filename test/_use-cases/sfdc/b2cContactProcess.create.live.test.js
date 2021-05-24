'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');
const common = require('../_common');

// Initialize local libraries for SFDC
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

describe('Progressive resolution B2C Commerce Customer creation scenarios via the B2CContactProcess API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Configure the total number of retries supported per test
    // noinspection JSAccessibilityCheck
    this.retries(config.get('unitTests.testData.testRetryCount'));

    // Initialize local variables
    let environmentDef,
        disablePurge,
        initResults,
        testProfile,
        testContact,
        testEmail,
        customerListId,
        customerListIdAlt,
        customerId,
        customerNo,
        siteId,
        b2cAdminAuthToken,
        sfdcAuthCredentials,
        syncGlobalEnable,
        sleepTimeout,
        purgeSleepTimeout;

    // Attempt to register the B2C Commerce Customer
    // noinspection DuplicatedCode
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Default the disable purge property
        disablePurge = config.get('unitTests.testData.disablePurge');

        // Default the sleepTimeout to enforce in unit-tests
        sleepTimeout = config.get('unitTests.testData.sleepTimeout');
        purgeSleepTimeout = sleepTimeout / 2;

        // Default the B2C Commerce test-data values
        customerId = config.get('unitTests.testData.b2cTestCustomerIdValue');
        customerNo = config.get('unitTests.testData.b2cTestCustomerNoValue');

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        customerListIdAlt = config.get('unitTests.testData.b2cSiteCustomerLists.RefArchGlobal');
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Retrieve a random email to leverage
        testEmail = common.getEmailForTestProfile();

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));

        // Update the email address with a random email
        testProfile.customer.email = testEmail;
        testProfile.customer.login = testEmail;

        // Initialize the testContact
        testContact = {
            Email: testProfile.customer.email,
            LastName: testProfile.customer.last_name
        };

        // Default the sync-configuration to leverage; sync-on-login and sync-once are enabled
        syncGlobalEnable = config.get('unitTests.b2cCRMSyncConfigManager.base');

        try {

            // Initialize the use-case test scenario (setup authTokens and purge legacy test-data)
            initResults = await useCaseProcesses.initUseCaseTests(environmentDef, siteId);

            // Shorthand the B2C administrative authToken
            b2cAdminAuthToken = initResults.multiCloudInitResults.b2cAdminAuthToken;

            // Audit the authorization token for future rest requests
            sfdcAuthCredentials = initResults.multiCloudInitResults.sfdcAuthCredentials;

            // Attempt to remove any stray and domain-specific customer records from B2C Commerce and the Salesforce Platform
            await useCaseProcesses.b2cCRMSyncCustomersPurgeManager(disablePurge, purgeSleepTimeout, b2cAdminAuthToken, sfdcAuthCredentials);

        } catch (e) {

            // Audit the error if one is thrown
            throw new Error(e);

        }

    });

    // Reset the output variable in-between tests
    beforeEach(async function () {

        // Attempt to remove any stray and domain-specific customer records from B2C Commerce and the Salesforce Platform
        await useCaseProcesses.b2cCRMSyncCustomersPurgeManager(disablePurge, purgeSleepTimeout, b2cAdminAuthToken, sfdcAuthCredentials);

    });

    //----------------------------------------------------------------
    // Contact creation scenarios (create new Account / Contact pairs)
    //----------------------------------------------------------------

    it('creates a Contact from a B2C CustomerList ID and Email attribute combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Create the contact definition that will be exercised
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        common.validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a Contact from a B2C CustomerList ID, Email, and LastName attribute combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Create the contact definition that will be exercised
        sourceContact = {
            Email: testContact.Email,
            LastName: testContact.LastName,
            B2C_CustomerList_ID__c: customerListId
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        common.validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a Contact from a B2C CustomerList ID, Email, LastName, and B2C CustomerId combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_ID__c: customerId
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Implement a pause to ensure the PlatformEvent fires (where applicable)
        await useCaseProcesses.sleep(purgeSleepTimeout);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        common.validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a Contact from a B2C CustomerList ID, Email, LastName, and B2C CustomerNo combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Create the sourceContact that will be used to exercise the process-service
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        common.validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a Contact that includes additional non-resolution specific field values', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Create the contact definition that will be exercised
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            Description: 'This is a test description',
            Title: 'This is a test title'
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        common.validateB2CCustomerListPropertiesExist(output);

    });

    it('creates two separate Contact records using the same Email and LastName spanning different B2C CustomerList IDs', async function () {

        // Initialize local variables
        let refArchResolveBody,
            refArchGlobalResolveBody,
            refArchSourceContact,
            refArchGlobalSourceContact,
            testResults;

        // Initialize the first request
        refArchSourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        refArchResolveBody = _getB2CContactProcessBody(refArchSourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchResolveBody);

        // Initialize the first request
        refArchGlobalSourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListIdAlt
        };

        // Build out the resolve object used to exercise the process-service
        refArchGlobalResolveBody = _getB2CContactProcessBody(refArchGlobalSourceContact);

        // Execute the process flow-request and capture the results for the 2nd customerList contact
        await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchGlobalResolveBody);

        // Execute a separate query to retrieve the contact details searching by email
        testResults = await contactAPIs.getByEmail(sfdcAuthCredentials.conn, testContact.Email, 10, false);

        // Validate that two separate contact records were retrieved
        assert.equal(testResults.length, 2, ' -- expected to find two Contact record associated to the test email address.');

    });

    it('creates a new contact when multiple Contacts are resolved by Email and LastName without a B2C CustomerList', async function () {

        // Initialize local variables
        let contactObject,
            sourceContact,
            resolveBody,
            testResults;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject);
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject);

        // Initialize the contact request
        sourceContact = {
            B2C_CustomerList_ID__c: customerListId,
            Email: testContact.Email,
            LastName: testContact.LastName
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Execute a separate query to retrieve the contact details searching by email
        testResults = await contactAPIs.getByEmail(sfdcAuthCredentials.conn, testContact.Email, 10, false);

        // Validate that two separate contact records were retrieved
        assert.equal(testResults.length, 3, ' -- expected to find three Contact record associated to the test email address.');

    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Attempt to remove any stray and domain-specific customer records from B2C Commerce and the Salesforce Platform
        await useCaseProcesses.b2cCRMSyncCustomersPurgeManager(disablePurge, purgeSleepTimeout, b2cAdminAuthToken, sfdcAuthCredentials);

        // Update the B2C CustomerList and activate the B2C CustomerList
        await useCaseProcesses.sfdcB2CCustomerListUpdate(sfdcAuthCredentials.conn, customerListId, true);
        await useCaseProcesses.sfdcB2CCustomerListUpdate(sfdcAuthCredentials.conn, customerListIdAlt, true);

    });

    // Reset the output variable in-between tests
    after(async function () {

        // Next, ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

    });

});

/**
 * @private
 * @function _getB2CContactProcessBody
 * @description Helper function to build out the B2CContactProcess REST API Body object.
 *
 * @param sourceContact {Object} Represents the sourceContact being submitted to the flow-service
 * @return {Object} Returns the service object-representation for processing
 */
function _getB2CContactProcessBody(sourceContact) {

    // Return the object structure expected by the service
    return {
        inputs: [{
            sourceContact: sourceContact
        }]
    };

}

/**
 * @private
 * @function _createAccountContactRelationship
 * @description Helper function to stand-up an Account / Contact record for the purpose of testing.  Use
 * this method to create these records when we need existing data created through external sources.
 *
 * @param sfdcAuthCredentials {Object} Represents the Salesforce Platform authentication credentials to leverage
 * @param environmentDef {Object} Represents the environment definition to leverage and infer the accountType from
 * @param contactObject {Object} Represents the contactObject to create
 */
async function _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject) {

    let accountName,
        output;

    // Default the accountName to leverage
    accountName = config.get('unitTests.testData.defaultAccountName');

    // Execute the pre-test logic to seed the expected test data
    output = await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName, environmentDef.sfScratchOrgProfile);

    // Return the output variable
    return output;

}
