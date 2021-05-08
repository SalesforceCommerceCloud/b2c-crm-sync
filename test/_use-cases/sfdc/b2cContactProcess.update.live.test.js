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

describe('Progressive resolution of a B2C Commerce Customer update scenarios via the B2CContactProcess API', function () {

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
        testEmail,
        testContact,
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
    // Progressive update scenarios (updating Contacts directly via the service)
    //----------------------------------------------------------------

    it('allows direct updates by B2C CustomerList, Email, and LastName', async function () {

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
            LastName: testContact.LastName,
            Email: testContact.Email,
            B2C_CustomerList_ID__c: customerListId,
            Audit_OCAPI_API_Response__c: true,
            Description: 'Testing direct updates of the Contact record.'
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('allows direct updates by B2C CustomerID', async function () {

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
            B2C_Customer_ID__c: customerId,
            Audit_OCAPI_API_Response__c: true,
            Description: 'Testing direct updates of the Contact record.'
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('allows direct updates by B2C CustomerList ID and B2C CustomerNo', async function () {

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
            B2C_CustomerList_ID__c: customerListId,
            B2C_Customer_No__c: customerNo,
            Audit_OCAPI_API_Response__c: true,
            Description: 'Testing direct updates of the Contact record.'
        };

        // Build out the resolve object used to exercise the process-service
        resolveBody = _getB2CContactProcessBody(sourceContact);

        // Execute the process flow-request and capture the results for the second contact creation test
        resolveOutput = await common.executeAndVerifyB2CProcessResult(environmentDef, sfdcAuthCredentials.conn.accessToken, resolveBody);

        // Compare the Contact identifiers and validate that they match / are the same
        assert.equal(output.contactId, resolveOutput.contactId, ' -- expected the contactIdentifiers to match and be the same');

    });

    it('allows direct updates by ContactID', async function () {

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
            Id: output.contactId,
            Audit_OCAPI_API_Response__c: true,
            Description: 'Testing direct updates of the Contact record.'
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
