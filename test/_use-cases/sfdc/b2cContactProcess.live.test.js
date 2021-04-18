'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize the B2C Commerce REST APIs
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');
const b2cRequestLib = require('../../../lib/_common/request');
const b2cCustomerListAPIs = require('../../../lib/qa/processes/_common/sfdc/b2cCustomerList');

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');
const common = require('../_common');

// Initialize local libraries for SFDC
const sfdcAuth = require('../../../lib/apis/sfdc/auth');
const flowAPIs = require('../../../lib/qa/processes/_common/sfdc/flow');
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

describe('Progressive resolution of a B2C Commerce Customer via the B2CContactProcess API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Initialize local variables
    let environmentDef,
        baseRequest,
        initResults,
        testProfile,
        testContact,
        profileUpdate,
        customerListId,
        customerListIdAlt,
        customerId,
        customerNo,
        siteId,
        b2cAdminAuthToken,
        sfdcAuthCredentials,
        registeredB2CCustomerNo,
        syncGlobalEnable,
        sleepTimeout,
        purgeSleepTimeout;

    // Attempt to register the B2C Commerce Customer
    // noinspection DuplicatedCode
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

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

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
        profileUpdate = config.util.toObject(config.get('unitTests.testData.updateTemplate'));

        // Initialize the testContact
        testContact = {
            Email: testProfile.customer.email,
            LastName: testProfile.customer.last_name
        };

        // Default the sync-configuration to leverage; sync-on-login and sync-once are enabled
        syncGlobalEnable = config.get('unitTests.b2cCRMSyncConfigManager.base');

        // Initialize the base request leveraged by this process
        baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

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

    //----------------------------------------------------------------
    // Error validation scenarios (enforce validation business rules in Flow)
    //----------------------------------------------------------------

    it('returns an error if non-identifiers are used without a B2C CustomerList for resolution via the B2CContactProcess service', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the expected customerList error message
        customerListErrorMessage = 'A B2C Commerce CustomerList ID is required for Contact Resolution with non Salesforce Platform identifiers.  Please include a B2C CustomerList ID and try again.';

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if an invalid or unknown B2C CustomerList is included in the request', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the expected customerList error message
        customerListErrorMessage = 'The B2C CustomerList could not be verified.  Please verify the B2C CustomerList provided -- and try again.';

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: 'invalidCustomerListID'
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if an invalid or unknown ContactID is included in the request', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the expected customerList error message
        customerListErrorMessage = 'No Contact was found with the ContactID specified in this request; please verify the Id value and try again.';

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            Id: '0018A00000dIEGyQAO'
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if an invalid AccountID is provided with the specified ContactID', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the output
        output = {};

        // First, attempt to create the account / contact relationship
        output.createResult = await _createAccountContactRelationship(
            sfdcAuthCredentials, environmentDef, testContact);

        // Default the expected customerList error message
        customerListErrorMessage = 'The AccountID provided is not associated to the specific Contact.  Please verify this relationship.';

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            Id: output.createResult.contactId,
            AccountId: '0018A00000dIEInQAO'
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if a valid ContactID / AccountID pair are provided without a valid B2C CustomerList ID', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the output
        output = {};

        // First, attempt to create the account / contact relationship
        output.createResult = await _createAccountContactRelationship(
            sfdcAuthCredentials, environmentDef, testContact);

        // Default the expected customerList error message
        customerListErrorMessage = 'Only Contacts with a B2C CustomerList can be processed.  Please provide a B2C CustomerList value and try again.';

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            Id: output.createResult.contactId,
            AccountId: output.createResult.accountId
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if the B2C CustomerList associated to a validated Contact is inActive', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the output
        output = {};

        // First, attempt to create the account / contact relationship
        output.createResult = await _createAccountContactRelationship(
            sfdcAuthCredentials, environmentDef, testContact);

        // Update the B2C CustomerList and deactivate the B2C CustomerList
        output.b2cCustomerListDeactivateResult = await useCaseProcesses.sfdcB2CCustomerListUpdate(
            sfdcAuthCredentials.conn, customerListId, false);

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            Id: output.createResult.contactId,
            AccountId: output.createResult.accountId
        };

        // Default the expected customerList error message
        customerListErrorMessage = 'B2C Commerce Integration is Disabled for this B2C Instance, CustomerList, or Contact.  Please check the Salesforce Org configuration.';

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output.b2cContactProcessResults = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output.b2cContactProcessResults);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.b2cContactProcessResults.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if the parent B2C Instance to a validated Contact is inActive', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the output
        output = {};

        // First, attempt to create the account / contact relationship
        output.createResult = await _createAccountContactRelationship(
            sfdcAuthCredentials, environmentDef, testContact);

        // First, retrieve the customerList definition using the id / name provided
        output.customerListGet = await b2cCustomerListAPIs.getByName(
            sfdcAuthCredentials.conn, customerListId);

        // Deactivate the parent B2C Instance for this customerList
        await useCaseProcesses.sfdcB2CInstanceUpdate(
            sfdcAuthCredentials.conn, output.customerListGet[0].B2C_Instance__c, false);

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            Id: output.createResult.contactId,
            AccountId: output.createResult.accountId
        };

        // Default the expected customerList error message
        customerListErrorMessage = 'B2C Commerce Integration is Disabled for this B2C Instance, CustomerList, or Contact.  Please check the Salesforce Org configuration.';

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output.b2cContactProcessResults = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Deactivate the parent B2C Instance for this customerList
        await useCaseProcesses.sfdcB2CInstanceUpdate(
            sfdcAuthCredentials.conn, output.customerListGet[0].B2C_Instance__c, true);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output.b2cContactProcessResults);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.b2cContactProcessResults.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

    });

    it('returns an error if a validated Contact has integration disabled', async function () {

        // Initialize the output scope
        let output,
            customerListErrorMessage,
            sourceContact,
            resolveBody;

        // Default the output
        output = {};

        // First, attempt to create the account / contact relationship
        output.createResult = await _createAccountContactRelationship(
            sfdcAuthCredentials, environmentDef, testContact);

        // Disable integration for this Contact record
        output.contactDisableIntegrationResult = await sObjectAPIs.update(
            sfdcAuthCredentials.conn, 'Contact', {
                Id: output.createResult.contactId,
                B2C_Disable_Integration__c: true
            });

        // Create the initial Contact footprint
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            Id: output.createResult.contactId,
            AccountId: output.createResult.accountId
        };

        // Default the expected customerList error message
        customerListErrorMessage = 'B2C Commerce Integration is Disabled for this B2C Instance, CustomerList, or Contact.  Please check the Salesforce Org configuration.';

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and examine the results
        output.b2cContactProcessResults = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Attempt to validate the processing-result
        _validateB2CProcessResultIsError(output.b2cContactProcessResults);

        // Verify that the specific errorMessage we're testing for is included in the errors collection
        assert.includeMembers(output.b2cContactProcessResults.data[0].outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');

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
        await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchGlobalResolveBody);

        // Execute a separate query to retrieve the contact details searching by email
        testResults = await contactAPIs.getByEmail(sfdcAuthCredentials.conn, testContact.Email, 10);

        // Validate that two separate contact records were retrieved
        assert.equal(testResults.length, 2, ' -- expected to find two Contact record associated to the test email address.');

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
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the pre / post testResults have matching Account / Contact records
        common.compareAccountContactIdentifiers(output, preTestResult);

    });

    it('resolves an existing Contact using B2C CustomerList and Email -- where the existing Contact uses the Contact default LastName (Unknown)', async function () {

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

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Implement a pause to ensure the PlatformEvent fires (where applicable)
        await useCaseProcesses.sleep(purgeSleepTimeout);

        // Purge the Account / Contact relationships
        await useCaseProcesses.sfdcAccountContactPurge(sfdcAuthCredentials.conn);

        // Update the B2C CustomerList and activate the B2C CustomerList
        await useCaseProcesses.sfdcB2CCustomerListUpdate(sfdcAuthCredentials.conn, customerListId, true);

    });

    // Reset the output variable in-between tests
    after(async function () {

        // Purge the customer data in B2C Commerce and SFDC
        await useCaseProcesses.b2cCustomerPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

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
 * @function _validateB2CProcessResultIsError
 * @description Helper function that conducts generic validation against the processing
 * results produced from calling the B2CContactProcess service.  This specific method tests
 * if an error was included in the processing results.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 */
function _validateB2CProcessResultIsError(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate that the REST response is well-formed and returns what was expected
    assert.equal(processResults.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
    assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
    assert.isArray(processResult.outputValues.errors, ' -- expected the errors collection to contain at least one value');
    assert.isFalse(processResult.outputValues.isSuccess, ' -- expected the resolution process to fail because a B2C CustomerList ID was not present');
    assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

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

