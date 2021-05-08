'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');
const common = require('../_common');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

describe('Progressive resolution of a B2C Commerce Customer via the B2CContactProcess API', function () {

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
        alternateLastName,
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

        // Initialize the testContact
        testContact = {
            Email: testProfile.customer.email,
            LastName: testProfile.customer.last_name
        };

        // Define the alternate lastName to leverage for tests
        alternateLastName = 'Alternate';

        // Default the sync-configuration to leverage; sync-on-login and sync-once are enabled
        syncGlobalEnable = config.get('unitTests.b2cCRMSyncConfigManager.base');

        try {

            // Initialize the use-case test scenario (setup authTokens and purge legacy test-data)
            initResults = await useCaseProcesses.initUseCaseTests(environmentDef, siteId);

            // Shorthand the B2C administrative authToken
            b2cAdminAuthToken = initResults.multiCloudInitResults.b2cAdminAuthToken;

            // Audit the authorization token for future rest requests
            sfdcAuthCredentials = initResults.multiCloudInitResults.sfdcAuthCredentials;

            // Is the purge disabled?
            if (disablePurge === true) {

                // Audit to the console that the purge is disabled
                console.log(' -- disablePurge is enabled: test-data is not cleaned-up after each test or test-run');

            } else {

                // Purge the customer data in B2C Commerce and SFDC
                await useCaseProcesses.b2cCustomerPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

            }

        } catch (e) {

            // Audit the error if one is thrown
            throw new Error(e);

        }

    });

    //----------------------------------------------------------------
    // Inheritance / progressive resolution scenarios (inherit existing Account / Contact pairs)
    //----------------------------------------------------------------

    it('resolves an existing Contact using LastName and Email -- where the existing Contact does not have a B2C CustomerList', async function () {

        // Initialize the output scope
        let output,
            sourceContact,
            contactObject,
            preTestResult,
            resolveBody;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email
        };

        // Create the test Account / Contact relationship that is being inherited.
        preTestResult = await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject);

        // Initialize the request
        sourceContact = {
            B2C_CustomerList_ID__c: customerListId,
            LastName: testContact.LastName,
            Email: testContact.Email
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the pre / post testResults have matching Account / Contact records
        common.compareAccountContactIdentifiers(output, preTestResult);

    });

    it('resolves an existing Contact using B2C CustomerList, Email, and LastName -- where the existing Contact uses the Contact default LastName (Unknown)', async function () {

        // Initialize local variables
        let output,
            resolveBody,
            updateOutput,
            sourceContact;

        // Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Update the body to include a different lastName
        resolveBody.inputs[0].sourceContact.LastName = testContact.LastName;

        // Execute the process flow-request and capture the results for the update test
        updateOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that the update was performed
        assert.equal(output.contactId, updateOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using B2C CustomerList ID, Email, and LastName values', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using B2C CustomerList ID, B2C CustomerID, Email, and LastName values', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_ID__c: customerId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using B2C CustomerList ID, B2C CustomerNo, Email, and LastName values', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using B2C CustomerList ID, Email, LastName, and a ContactID values', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput,
            testContactId;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Capture the contactId value from the first test
        testContactId = output.contactId;

        // Reset the resolveBody to leverage the ContactID as the identifier of choice
        resolveBody.inputs[0].sourceContact = { Id: testContactId };

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using only the ContactID', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Re-Initialize the request
        sourceContact = {
            Email: testContact.Email,
            Id: output.contactId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using only the B2C CustomerID', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_ID__c: customerId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Re-Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_Customer_ID__c: customerId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('resolves an existing Contact using only the B2C CustomerList ID and B2C CustomerNo', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Re-Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('returns an error when multiple records are resolved by B2C CustomerList, Email, and LastName', async function () {

        // Initialize the output scope
        let output,
            sourceContact,
            contactObject,
            errorMessage,
            resolveBody;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject);
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject);

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Default the errorMessage we're looking for
        errorMessage = 'Multiple Contacts were resolved.  Please provide more precise resolution properties for the sourceContact -- and try again.';

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessErrorResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Validate that the errorMessage was found in the errorsCollection
        assert.includeMembers(output.data[0].outputValues.errors, [errorMessage], '-- expected the errors to contain the duplicate records found error-message');

    });

    it('returns an error when multiple records are resolved by B2C CustomerList and Email', async function () {

        // Initialize the output scope
        let output,
            sourceContact,
            contactObject1,
            contactObject2,
            errorMessage,
            resolveBody;

        // First, create the account / contact object representation we're going to test against
        contactObject1 = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject1);

        // Next, create the second account / contact object representation we're going to test against
        contactObject2 = {
            LastName: alternateLastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject2);

        // Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Default the errorMessage we're looking for
        errorMessage = 'Multiple Contacts were resolved.  Please provide more precise resolution properties for the sourceContact -- and try again.';

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessErrorResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Validate that the errorMessage was found in the errorsCollection
        assert.includeMembers(output.data[0].outputValues.errors, [errorMessage], '-- expected the errors to contain the duplicate records found error-message');

    });

    it('returns an error when multiple records are resolved by B2C CustomerList and CustomerId', async function () {

        // Initialize the output scope
        let output,
            sourceContact,
            contactObject1,
            contactObject2,
            errorMessage,
            resolveBody;

        // First, create the account / contact object representation we're going to test against
        contactObject1 = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo,
            B2C_Customer_ID__c: customerId
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject1);

        // Next, create the second account / contact object representation we're going to test against
        contactObject2 = {
            LastName: alternateLastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo,
            B2C_Customer_ID__c: customerId
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject2);

        // Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_ID__c: customerId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Default the errorMessage we're looking for
        errorMessage = 'Multiple Contacts were resolved.  Please provide more precise resolution properties for the sourceContact -- and try again.';

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessErrorResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Validate that the errorMessage was found in the errorsCollection
        assert.includeMembers(output.data[0].outputValues.errors, [errorMessage], '-- expected the errors to contain the duplicate records found error-message');

    });

    it('returns an error when multiple records are resolved by B2C CustomerList and CustomerNo', async function () {

        // Initialize the output scope
        let output,
            sourceContact,
            contactObject1,
            contactObject2,
            errorMessage,
            resolveBody;

        // First, create the account / contact object representation we're going to test against
        contactObject1 = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject1);

        // Next, create the second account / contact object representation we're going to test against
        contactObject2 = {
            LastName: alternateLastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Create the test Account / Contact relationship that is being inherited.
        await _createAccountContactRelationship(sfdcAuthCredentials, environmentDef, contactObject2);

        // Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Default the errorMessage we're looking for
        errorMessage = 'Multiple Contacts were resolved.  Please provide more precise resolution properties for the sourceContact -- and try again.';

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessErrorResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Validate that the errorMessage was found in the errorsCollection
        assert.includeMembers(output.data[0].outputValues.errors, [errorMessage], '-- expected the errors to contain the duplicate records found error-message');

    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Implement a pause to ensure the PlatformEvent fires (where applicable)
        await useCaseProcesses.sleep(purgeSleepTimeout);

        // Is the purge disabled?
        if (disablePurge === true) {

            // Audit to the console that the purge is disabled
            console.log(' -- useCaseProcesses.sfdcAccountContactPurge() is disabled; test-data is not cleaned-up after each test');

        } else {

            // Purge the Account / Contact relationships
            await useCaseProcesses.sfdcAccountContactPurge(sfdcAuthCredentials.conn);

        }

        // Update the B2C CustomerList and activate the B2C CustomerList
        await useCaseProcesses.sfdcB2CCustomerListUpdate(sfdcAuthCredentials.conn, customerListId, true);
        await useCaseProcesses.sfdcB2CCustomerListUpdate(sfdcAuthCredentials.conn, customerListIdAlt, true);

    });

    // Reset the output variable in-between tests
    after(async function () {

        // Is the purge disabled?
        if (disablePurge === true) {

            // Audit to the console that the purge is disabled
            console.log(' -- useCaseProcesses.b2cCustomerPurge() is disabled; test-data is not cleaned-up after tests');

        } else {

            // Purge the customer data in B2C Commerce and SFDC
            await useCaseProcesses.b2cCustomerPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

        }

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

