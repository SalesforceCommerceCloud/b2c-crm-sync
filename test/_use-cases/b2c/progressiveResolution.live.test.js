'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');

// Initialize local libraries for SFDC
const sfdcAuth = require('../../../lib/apis/sfdc/auth');
const flowAPIs = require('../../../lib/qa/processes/_common/sfdc/flow');
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');
const sfdcAccountContactPurge = require('../../../test/_common/processes/_sfdcAccountContactPurge');

// Exercise the retrieval of the operation mode
describe('Progressive resolution of a B2C Commerce Customer via the B2CContactProcess API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    this.timeout(30000);

    // Initialize local variables
    let environmentDef,
        testProfile,
        testContact,
        sfdcAuthCredentials,
        testCustomerListIdValue;

    // Attempt to register the B2C Commerce Customer
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

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

    it('returns an error if non-identifiers are used without a B2C CustomerList for resolution via the B2CContactProcess service', async function () {

        // Initialize the output scope
        let output,
            processResult,
            customerListErrorMessage,
            requestBody;

        // Default the customerListErrorMessage
        customerListErrorMessage = 'A B2C Commerce CustomerList ID is required for Contact Resolution with non Salesforce Platform identifiers.  Please include a B2C CustomerList ID and try again.';

        // Initialize the request
        requestBody = {
            inputs: [
                {
                    sourceContact: {
                        LastName: testContact.LastName,
                        Email: testContact.Email
                    }
                }
            ]
        };

        // Execute the process flow-request and examine the results
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, requestBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        // Validate that the REST response is well-formed and returns what was expected
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isArray(processResult.outputValues.errors, ' -- expected the errors collection to contain at least one value');
        assert.includeMembers(processResult.outputValues.errors, [customerListErrorMessage], '-- expected the errors to contain the B2C CustomerList error message');
        assert.isFalse(processResult.outputValues.isSuccess, ' -- expected the resolution process to fail because a B2C CustomerList ID was not present');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

    });

    it('creates a Contact from an Email and B2C CustomerList ID combination', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody;

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            inputs: [
                {
                    sourceContact: {
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
                    }
                }
            ]
        };

        // Execute the process flow-request and capture the results for the contact creation test
        output = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Shorthand a reference to the response data
        processResult = output.data[0];

        // Validate the REST API response is well-formed
        assert.equal(output.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(processResult.outputValues.errors, ' -- expected no errors to be included in the processing results');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

    })

    it('creates a Contact from an Email, LastName, and B2C CustomerList ID combination', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
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
        assert.isNull(processResult.outputValues.errors, ' -- expected no errors to be included in the processing results');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

    })

    it('creates a Contact from a CustomerId, Email, LastName, and B2C CustomerList ID combination', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            testCustomerIdValue,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');
        testCustomerIdValue = config.get('unitTests.testData.b2cTestCustomerIdValue');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue,
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
        assert.isNull(processResult.outputValues.errors, ' -- expected no errors to be included in the processing results');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');
        assert.equal(processResult.outputValues.Contact.B2C_Customer_ID__c, testCustomerIdValue, ' -- expected the B2C Customer Id values to be equal');

    })

    it('creates a Contact from an Email, LastName, B2C CustomerList ID, and B2C Customer No combination', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            testCustomerNoValue,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');
        testCustomerNoValue = config.get('unitTests.testData.b2cTestCustomerNoValue');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue,
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
        assert.isNull(processResult.outputValues.errors, ' -- expected no errors to be included in the processing results');
        assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');
        assert.equal(processResult.outputValues.Contact.B2C_Customer_No__c, testCustomerNoValue, ' -- expected the B2C Customer No values to be equal');

    })

    it('creates a simple Contact (B2C CustomerList, LastName, Email) if one does not exist', async function() {

        // Initialize the output scope
        let output,
            processResult,
            requestBody;

        // Initialize the request
        requestBody = {
            "inputs": [
                {
                    "sourceContact": {
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

        ////////////////////////////////////////////////////////////////
        // Validate that the Account and Contact Objects are created
        ////////////////////////////////////////////////////////////////
        assert.isTrue(processResult.outputValues.hasOwnProperty('Account'), ' -- expected the Account property to exist in the output object');
        assert.isTrue(processResult.outputValues.hasOwnProperty('Contact'), ' -- expected the Contact property to exist in the output object');
        assert.isObject(processResult.outputValues.Account, ' -- expected the Account object to exist in the output object');
        assert.isObject(processResult.outputValues.Contact, ' -- expected the Contact object to exist in the output object');

        ////////////////////////////////////////////////////////////////
        // Validate that the Account and Contact Objects seeded with the correct properties
        ////////////////////////////////////////////////////////////////
        assert.isTrue(processResult.outputValues.Account.hasOwnProperty('RecordTypeId'), ' -- expected the Account object to have a recordType relationship');
        assert.isTrue(processResult.outputValues.Account.hasOwnProperty('Id'), ' -- expected the Account object to have a primary key');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('Id'), ' -- expected the Contact object to have a primary key');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('AccountId'), ' -- expected the Account object to have an Account relationship');
        assert.equal(processResult.outputValues.Contact.AccountId, processResult.outputValues.Account.Id, ' -- expected the Account object Id and Contact relationship values to be the same');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList_ID__c'), ' -- expected the Contact object to have a B2C CustomerList static reference');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList__c'), ' -- expected the Contact object to have a B2C CustomerList object-relationship reference');

    });

    it('inherits an existing Contact if LastName and Email match -- and no B2C CustomerList exists', async function() {

        // Initialize the output scope
        let output,
            contactObject,
            accountName,
            preTestResult,
            processResult,
            requestBody;

        // First, create the account / contact object representation we're going to test against
        contactObject = {
            LastName: testContact.LastName,
            Email: testContact.Email
        };

        // Default the accountName to leverage
        accountName = config.get('unitTests.testData.defaultAccountName');

        // Execute the pre-test logic to seed the expected test data
        preTestResult = await useCaseProcesses.sfdcAccountContactCreate(sfdcAuthCredentials, contactObject, accountName);

        // Initialize the request
        requestBody = {
            "inputs": [
                {
                    "sourceContact": {
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

        ////////////////////////////////////////////////////////////////
        // Validate that the Account and Contact Objects are created
        ////////////////////////////////////////////////////////////////
        assert.isTrue(processResult.outputValues.hasOwnProperty('Account'), ' -- expected the Account property to exist in the output object');
        assert.isTrue(processResult.outputValues.hasOwnProperty('Contact'), ' -- expected the Contact property to exist in the output object');
        assert.isObject(processResult.outputValues.Account, ' -- expected the Account object to exist in the output object');
        assert.isObject(processResult.outputValues.Contact, ' -- expected the Contact object to exist in the output object');

        ////////////////////////////////////////////////////////////////
        // Validate that the Account and Contact Objects seeded with the correct properties
        ////////////////////////////////////////////////////////////////
        assert.isTrue(processResult.outputValues.Account.hasOwnProperty('RecordTypeId'), ' -- expected the Account object to have a recordType relationship');
        assert.isTrue(processResult.outputValues.Account.hasOwnProperty('Id'), ' -- expected the Account object to have a primary key');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('Id'), ' -- expected the Contact object to have a primary key');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('AccountId'), ' -- expected the Account object to have an Account relationship');
        assert.equal(processResult.outputValues.Contact.AccountId, processResult.outputValues.Account.Id, ' -- expected the Account object Id and Contact relationship values to be the same');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList_ID__c'), ' -- expected the Contact object to have a B2C CustomerList static reference');
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty('B2C_CustomerList__c'), ' -- expected the Contact object to have a B2C CustomerList object-relationship reference');

        ////////////////////////////////////////////////////////////////
        // Validate that the Account and Contact resolved are the ones newly created
        ////////////////////////////////////////////////////////////////
        assert.equal(processResult.outputValues.Account.Id, preTestResult.accountCreateResult.id, ' -- expected the Account objects (created and test-data) in this test to have the same Id value');
        assert.equal(processResult.outputValues.Contact.Id, preTestResult.contactCreateResult.id, ' -- expected the Contact objects (created and test-data) in this test to have the same Id value');

    });

    it('creates a new Contact record if an Email and LastName match are associated to a different B2C CustomerList', async function() {

        // Initialize local variables
        let refArchBody,
            refArchGlobalBody,
            refArchOutput,
            refArchGlobalOutput,
            testResults;

        // Initialize the first request
        refArchBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cSiteCustomerLists.RefArch').toString()
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the 1st customerList contac
        refArchOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchBody);

        // Initialize the second request
        refArchGlobalBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: config.get('unitTests.testData.b2cSiteCustomerLists.RefArchGlobal').toString()
                    }
                }
            ]
        }

        // Execute the process flow-request and capture the results for the 2nd customerList contact
        refArchGlobalOutput = await flowAPIs.postB2CContactProcess(environmentDef, sfdcAuthCredentials.conn.accessToken, refArchGlobalBody);

        // Execute a separate query to retrieve the contact details searching by email
        testResults = await contactAPIs.getByEmail(sfdcAuthCredentials.conn, testContact.Email, 10);

        ////////////////////////////////////////////////////////////////
        // Validate the REST API response is well formed
        ////////////////////////////////////////////////////////////////
        assert.equal(refArchOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(refArchOutput.data[0].isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(refArchOutput.data[0].outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(refArchOutput.data[0].errors, ' -- expected the property to return a null value');
        assert.isTrue(refArchOutput.data[0].isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(refArchOutput.data[0].outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Validate that the 2nd request has executed successfully
        assert.equal(refArchGlobalOutput.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
        assert.isTrue(refArchGlobalOutput.data[0].isSuccess, ' -- expected the isSuccess flag to have a value of true');
        assert.isObject(refArchGlobalOutput.data[0].outputValues, ' -- expected the outputValues property to exist on the output object');
        assert.isNull(refArchGlobalOutput.data[0].errors, ' -- expected the property to return a null value');
        assert.isTrue(refArchGlobalOutput.data[0].isSuccess, ' -- expected the isSuccess to return a null value');
        assert.equal(refArchGlobalOutput.data[0].outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

        // Validate that two separate contact records were retrieved
        assert.equal(testResults.length, 2, ' -- expected to find two Contact record associated to the test email address.');

    });

    it('successfully resolves an existing Contact using Email and B2C CustomerList ID values', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId,
            testCustomerListIdValue,
            identifierErrorMessage;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Default the identifier error message
        identifierErrorMessage = 'Successfully resolved a record but could not process an update.  Please include at least one set of identifiers to update this record.';

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
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
        assert.isFalse(resolveOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of false; resolution worked but updates failed');
        assert.isNotNull(resolveOutputResults.outputValues.errors, ' -- expected the error property to contain one error -- indicating that updates failed but a record was resolved');
        assert.includeMembers(resolveOutputResults.outputValues.errors, [identifierErrorMessage], ' -- expected this error message to be included in the output results');

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, resolveContactId, ' -- expected the contactIdentifiers to match and be the same');

    })


    it('successfully inherits a Contact with matching Email and B2C CustomerList values whose lastName is the Contact default', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
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

        // Update the body to include a different lastName
        resolveBody.inputs[0].sourceContact.LastName = testContact.LastName;

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
        assert.isTrue(resolveOutputResults.outputValues.isSuccess, ' -- expected the isSuccess flag to have a value of true; the default lastName should resolve');
        assert.isNull(resolveOutputResults.outputValues.errors, ' -- expected the error property to contain zero errors -- resolution via the default lastName should be successful');

        ////////////////////////////////////////////////////////////////
        // Compare the Contact identifiers and validate that the update was performed
        ////////////////////////////////////////////////////////////////
        assert.equal(testContactId, resolveContactId, ' -- expected the contactIdentifiers to match and be the same');

    })

    it('successfully resolves an existing Contact using Email, LastName, and B2C CustomerList ID values', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
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

    })

    it('successfully resolves an existing Contact using a B2C Customer ID value', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId,
            testCustomerIdValue,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerIdValue = config.get('unitTests.testData.b2cTestCustomerIdValue');
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue,
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

    })

    it('successfully resolves an existing Contact using B2C CustomerList ID and B2C Customer No values', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId,
            testCustomerNoValue,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerNoValue = config.get('unitTests.testData.b2cTestCustomerNoValue');
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue,
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

    })

    it('successfully resolves an existing Contact using a ContactID value', async function() {

        // Initialize local variables
        let output,
            processResult,
            resolveBody,
            resolveOutput,
            resolveOutputResults,
            resolveContactId,
            testContactId,
            testCustomerListIdValue;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        resolveBody = {
            "inputs": [
                {
                    "sourceContact": {
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
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

    })

    it('allows direct updates driven by an existing Email, LastName, and a B2C CustomerList ID', async function() {

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
            "inputs": [
                {
                    "sourceContact": {
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
            "inputs": [
                {
                    "sourceContact": {
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

    it('allows direct updates driven by an existing ContactID', async function() {

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
            "inputs": [
                {
                    "sourceContact": {
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
            "inputs": [
                {
                    "sourceContact": {
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

    it('allows direct updates driven by an existing B2C CustomerListID and CustomerNo', async function() {

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
            testCustomerListIdValue,
            testCustomerNoIdValue,
            testDescription;

        // Default the test customerId value
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');
        testCustomerNoIdValue = config.get('unitTests.testData.b2cTestCustomerNoValue');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        refArchBody = {
            "inputs": [
                {
                    "sourceContact": {
                        B2C_CustomerList_ID__c: testCustomerListIdValue,
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
            "inputs": [
                {
                    "sourceContact": {
                        B2C_CustomerList_ID__c: testCustomerListIdValue,
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

    })

    it('allows direct updates driven by an existing B2C CustomerID', async function() {

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
            testCustomerListIdValue,
            testDescription;

        // Default the test customerId value
        testCustomerIdValue = config.get('unitTests.testData.b2cTestCustomerIdValue');
        testCustomerListIdValue = config.get('unitTests.testData.b2cSiteCustomerLists.RefArch');

        // Initialize the first request; seed a customerList and disable the integration
        // so that we don't create an expectation to trigger OCAPI updates
        refArchBody = {
            "inputs": [
                {
                    "sourceContact": {
                        B2C_Customer_ID__c: testCustomerIdValue,
                        LastName: testContact.LastName,
                        Email: testContact.Email,
                        B2C_CustomerList_ID__c: testCustomerListIdValue
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
            "inputs": [
                {
                    "sourceContact": {
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

    })

    // Reset the output variable in-between tests
    afterEach( async function() {

        // Purge the Account / Contact contacts
        await sfdcAccountContactPurge(sfdcAuthCredentials.conn);

    });

});

/**
 *
 * @param processResults
 */
function validateB2CProcessResult(processResults) {

    // Initialize local variables
    let processResult;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Validate the REST API response is well-formed
    assert.equal(processResults.status, 200, ' -- expected a 200 status code from the Salesforce Platform');
    assert.isTrue(processResult.isSuccess, ' -- expected the isSuccess flag to have a value of true');
    assert.isObject(processResult.outputValues, ' -- expected the outputValues property to exist on the output object');
    assert.isNull(processResult.outputValues.errors, ' -- expected no errors to be included in the processing results');
    assert.isTrue(processResult.outputValues.isSuccess, ' -- expected the isSuccess to return a null value');
    assert.equal(processResult.outputValues.Flow__InterviewStatus, 'Finished', ' -- expected the Flow_InterviewStatus to have a value of Finished.');

}
