'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize tearDown helpers
const useCaseProcesses = require('../processes');

// Initialize local libraries for SFDC
const sfdcAuth = require('../../../lib/apis/sfdc/auth');
const flowAPIs = require('../../../lib/qa/processes/_common/sfdc/flow');
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const sfdcAccountContactPurge = require('../processes/_sfdcAccountContactPurge');

// Exercise the retrieval of the operation mode
describe('Progressive resolution of a B2C Commerce Customer via the B2CContactProcess API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    this.timeout(30000);

    // Initialize local variables
    let environmentDef,
        testProfile,
        testContact,
        sfdcAuthCredentials,
        testCustomerIdValue,
        testCustomerNoValue,
        refArchCustomerListIdValue,
        refArchGlobalCustomerListIdValue;

    // Attempt to register the B2C Commerce Customer
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Default the B2C Commerce test-data values
        testCustomerIdValue = config.get('unitTests.testData.b2cTestCustomerIdValue');
        testCustomerNoValue = config.get('unitTests.testData.b2cTestCustomerNoValue');

        refArchCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');
        refArchGlobalCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArchGlobal');

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));

        // Initialize the testContact
        testContact = {
            Email: testProfile.customer.email,
            LastName: testProfile.customer.last_name
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

    // Reset the output variable in-between tests
    beforeEach(async function () {

        // Purge the Account / Contact contacts
        await sfdcAccountContactPurge(sfdcAuthCredentials.conn);

    });

    /*
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

    it('creates a Contact from a B2C CustomerList ID and Email combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: refArchCustomerListIdValue
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        _validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a Contact from a B2C CustomerList ID, Email, LastName combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: refArchCustomerListIdValue
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        _validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a Contact from a B2C CustomerList ID, Email, LastName, and CustomerId combination', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: refArchCustomerListIdValue,
            B2C_Customer_ID__c: testCustomerIdValue
        };

        // Create the object to be included in the services body
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the B2C CustomerList properties exist in the service-output
        _validateB2CCustomerListPropertiesExist(output);

    });

    it('creates a new Contact record if an existing Contact\'s Email and LastName match and are associated to a different B2C CustomerList', async function () {

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
            B2C_CustomerList_ID__c: refArchCustomerListIdValue
        };

        // Build out the resolve object used to exercise the process-service
        refArchResolveBody = _getB2CContactProcessBody(refArchSourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchResolveBody);

        // Initialize the first request
        refArchGlobalSourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: refArchGlobalCustomerListIdValue
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

     */
    // TODO: Not Passing -- need to revisit and address
    it('inherits an existing Contact if LastName and Email match -- and no B2C CustomerList exists', async function () {

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
            B2C_CustomerList_ID__c: refArchCustomerListIdValue
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Verify that the pre / post testResults have matching Account / Contact records
        _compareAccountContactIdentifiers(output, preTestResult);

    });

    it('successfully resolves an existing Contact using B2C CustomerList, Email, and whose lastName is the Contact default', async function () {

        // Initialize local variables
        let output,
            resolveBody,
            updateOutput,
            sourceContact;

        // Initialize the request
        sourceContact = {
            Email: testContact.Email,
            B2C_CustomerList_ID__c: refArchCustomerListIdValue
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Update the body to include a different lastName
        resolveBody.inputs[0].sourceContact.LastName = testContact.LastName;

        // Execute the process flow-request and capture the results for the update test
        updateOutput = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that the update was performed
        assert.equal(output.contactId, updateOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    // TODO: Not Passing -- need to revisit and address
    it('successfully resolves an existing Contact using B2C CustomerList ID, Email, and LastName values', async function () {

        // Initialize local variables
        let output,
            sourceContact,
            resolveBody,
            resolveOutput;

        // Initialize the request
        sourceContact = {
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: refArchCustomerListIdValue
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the contact creation test
        output = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);
        resolveOutput = await _executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('successfully resolves an existing Contact using a B2C Customer ID value', async function () {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: refArchCustomerListIdValue,
                        B2C_Customer_ID__c: testCustomerIdValue
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testContactId = processResult.outputValues.Contact.Id;

        // Execute the process flow-request and capture the results for the update test
        resolveOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand access to the output results
        resolveOutputResults = resolveOutput.data[0];

        // Create a reference to the contact identifier well validate
        resolveContactId = resolveOutputResults.outputValues.Contact.Id;

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed and predictable
        ////////////////////////////////////////////////////////////////
        assert.equal(resolveOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(resolveOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isNull(resolveOutputResults.outputValues.errors, ' -- expected the error property to not null / empty; no errors should be thrown');

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, resolveContactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('successfully resolves an existing Contact using B2C CustomerList ID and B2C Customer No values', async function () {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: refArchCustomerListIdValue,
                        B2C_Customer_No__c: testCustomerNoValue
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testContactId = processResult.outputValues.Contact.Id;

        // Execute the process flow-request and capture the results for the update test
        resolveOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand access to the output results
        resolveOutputResults = resolveOutput.data[0];

        // Create a reference to the contact identifier well validate
        resolveContactId = resolveOutputResults.outputValues.Contact.Id;

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed and predictable
        ////////////////////////////////////////////////////////////////
        assert.equal(resolveOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(resolveOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isNull(resolveOutputResults.outputValues.errors, ' -- expected the error property to not null / empty; no errors should be thrown');

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, resolveContactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('successfully resolves an existing Contact using a ContactID value', async function () {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: refArchCustomerListIdValue
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testContactId = processResult.outputValues.Contact.Id;

        // Reset the resolveBody to leverage the ContactID as the identifier of choice
        resolveBody.inputs[0].sourceContact = { Id: testContactId };

        // Execute the process flow-request and capture the results for the update test
        resolveOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand access to the output results
        resolveOutputResults = resolveOutput.data[0];

        // Create a reference to the contact identifier well validate
        resolveContactId = resolveOutputResults.outputValues.Contact.Id;

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed and predictable
        ////////////////////////////////////////////////////////////////
        assert.equal(resolveOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(resolveOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isNull(resolveOutputResults.outputValues.errors, ' -- expected the error property to not null / empty; no errors should be thrown');

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, resolveContactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('allows direct updates driven by an existing Email, LastName, and a B2C CustomerList ID', async function () {

        // Initialize the output scope
        let output,
            processResult,
            requestBody,
            updateRequestBody,
            testDescription,
            testContactId,
            updateOutput,
            updateOutputResults,
            updateContactId,
            contactToValidate;

        // Initialize the request
        requestBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cCustomerList').toString()
                    }
                }
            ]
        }

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, requestBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testDescription = '... this is a test description to validate update-behavior';
        testContactId = processResult.outputValues.Contact.Id;

        // Attempt to update the contact without using its ContactID
        updateRequestBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cCustomerList').toString(),
                        Description: testDescription
                    }
                }
            ]
        };

        // Execute the process flow-request and examine the results
        updateOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, updateRequestBody);

        // Shorthand access to the output results
        updateOutputResults = updateOutput.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(updateOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(updateOutputResults.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(updateOutputResults.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(updateOutputResults.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(updateOutputResults.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(updateOutputResults.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Create a reference to the contact identifier well validate
        updateContactId = updateOutputResults.outputValues.Contact.Id;

        // Retrieve the Contact details
        contactToValidate = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn, 'Contact', testContactId);

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, updateContactId, ' -- expected the contactIdentifiers to match and be the same');
        assert.equal(contactToValidate.Description, testDescription, ' -- expected the updated description to be set to the testDescription value');

    });

    it('allows direct updates driven by an existing ContactID', async function () {

        // Initialize local variables
        let refArchBody,
            output,
            processResult,
            updateBody,
            updateOutput,
            updateOutputResults,
            contactToValidate,
            testContactId,
            updateContactId,
            testDescription;

        // Initialize the first request
        refArchBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cSiteCustomerLists.RefArch').toString()
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testDescription = '... this is a test description to validate update-behavior';
        testContactId = processResult.outputValues.Contact.Id;

        // Initialize the second request
        updateBody = {
            inputs: [
                {
                    sourceContact: {
                        Id: testContactId,
                        Description: testDescription
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the update test
        updateOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, updateBody);

        // Shorthand access to the output results
        updateOutputResults = updateOutput.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(updateOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(updateOutputResults.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(updateOutputResults.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(updateOutputResults.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(updateOutputResults.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(updateOutputResults.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Create a reference to the contact identifier well validate
        updateContactId = updateOutputResults.outputValues.Contact.Id;

        // Retrieve the Contact details
        contactToValidate = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn, 'Contact', testContactId);

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, updateContactId, ' -- expected the contactIdentifiers to match and be the same');
        assert.equal(contactToValidate.Description, testDescription, ' -- expected the updated description to be set to the testDescription value');

    });

    it('allows direct updates driven by an existing B2C CustomerListID and CustomerNo', async function () {

        // Initialize local variables
        let output,
            refArchBody,
            processResult,
            updateBody,
            updateOutput,
            updateOutputResults,
            updateContactId,
            contactToValidate,
            testContactId,
            refArchCustomerListIdValue,
            testCustomerNoIdValue,
            testDescription;

        // Default the test customerId value
        refArchCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');
        testCustomerNoIdValue = config.get('unitTests.testData.b2cTestCustomerNoValue');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        refArchBody = {
            inputs: [
                {
                    sourceContact: {
                        B2C_CustomerList_ID__c: refArchCustomerListIdValue,
                        B2C_Customer_No__c: testCustomerNoIdValue,
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testDescription = '... this is a test description to validate update-behavior';
        testContactId = processResult.outputValues.Contact.Id;

        // Initialize the second request
        updateBody = {
            inputs: [
                {
                    sourceContact: {
                        B2C_CustomerList_ID__c: refArchCustomerListIdValue,
                        B2C_Customer_No__c: testCustomerNoIdValue,
                        Description: testDescription
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the update test
        updateOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, updateBody);

        // Shorthand access to the output results
        updateOutputResults = updateOutput.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed and predictable
        ////////////////////////////////////////////////////////////////
        assert.equal(updateOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(updateOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isNull(updateOutputResults.outputValues.errors, ' -- expected the error property to be null / empty; no errors should be thrown');

        // Create a reference to the contact identifier well validate
        updateContactId = updateOutputResults.outputValues.Contact.Id;

        // Retrieve the Contact details
        contactToValidate = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn, 'Contact', testContactId);

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, updateContactId, ' -- expected the contactIdentifiers to match and be the same');
        assert.equal(contactToValidate.Description, testDescription, ' -- expected the updated description to be set to the testDescription value');

    });

    it('allows direct updates driven by an existing B2C CustomerID', async function () {

        // Initialize local variables
        let output,
            refArchBody,
            processResult,
            updateBody,
            updateOutput,
            updateOutputResults,
            updateContactId,
            testContactId,
            contactToValidate,
            testCustomerIdValue,
            refArchCustomerListIdValue,
            testDescription;

        // Default the test customerId value
        testCustomerIdValue = config.get('unitTests.testData.b2cTestCustomerIdValue');
        refArchCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        refArchBody = {
            inputs: [
                {
                    sourceContact: {
                        B2C_Customer_ID__c: testCustomerIdValue,
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: refArchCustomerListIdValue
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected the property to return a null value');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Default the test description used to validate the update
        testDescription = '... this is a test description to validate update-behavior';
        testContactId = processResult.outputValues.Contact.Id;

        // Initialize the second request
        updateBody = {
            inputs: [
                {
                    sourceContact: {
                        B2C_Customer_ID__c: testCustomerIdValue,
                        Description: testDescription
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the update test
        updateOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, updateBody);

        // Shorthand access to the output results
        updateOutputResults = updateOutput.data[0];

        // Create a reference to the contact identifier well validate
        updateContactId = updateOutputResults.outputValues.Contact.Id;

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed and predictable
        ////////////////////////////////////////////////////////////////
        assert.equal(updateOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(updateOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isNull(updateOutputResults.outputValues.errors, ' -- expected the error property to not null / empty; no errors should be thrown');

        // Retrieve the Contact details
        contactToValidate = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn, 'Contact', testContactId);

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, updateContactId, ' -- expected the contactIdentifiers to match and be the same');
        assert.equal(contactToValidate.Description, testDescription, ' -- expected the updated description to be set to the testDescription value');

    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Purge the Account / Contact contacts
        await sfdcAccountContactPurge(sfdcAuthCredentials.conn);

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
 * @function _validateB2CCustomerListPropertiesExist
 * @description Helper function that validates the B2C CustomerList properties are found in
 * a given B2CContactProcess result.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 */
function _validateB2CCustomerListPropertiesExist(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate that the customerList properties are seeded
    assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList_ID__c'), ' -- expected the Contact object to have a B2C CustomerList static reference');
    assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList__c'), ' -- expected the Contact object to have a B2C CustomerList object-relationship reference');

}

/**
 * @private
 * @function _compareAccountContactIdentifiers
 * @description Helper function to compare the AccountId / ContactIds returned by the B2CContactProcess flow against
 * an Account / Contact record that contains the expected Account / Contact identifiers.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 * @param preTestResult {Object} Represents the Account / Contact pair containing the identifiers to be validated
 * @private
 */
function _compareAccountContactIdentifiers(processResults, preTestResult) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate that the Account and Contact resolved are the ones newly created
    assert.equal(processResult.outputValues.Account.Id, preTestResult.accountId, ' -- expected the Account objects (created and test-data) in this test to have the same Id value');
    assert.equal(processResult.outputValues.Contact.Id, preTestResult.contactId, ' -- expected the Contact objects (created and test-data) in this test to have the same Id value');

}
