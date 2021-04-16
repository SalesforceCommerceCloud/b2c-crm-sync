'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local libraries for B2C Commerce
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');

// Initialize local libraries for SFDC
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

// Exercise the retrieval of the operation mode
describe('Authenticating a B2C Customer Profile via the OCAPI Shop API', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    this.timeout(30000);

    // Initialize local variables
    let environmentDef,
        testProfile,
        customerListId,
        siteId,
        b2cGuestAuth,
        b2cAdminAuthToken,
        sfdcAuthCredentials,
        baseRequest,
        multiCloudInitResults,
        registeredB2CCustomerNo;

    // Attempt to register the B2C Commerce Customer
    before(async function () {

        // Retrieve the runtime environment
        environmentDef = getRuntimeEnvironment();

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));

        // Initialize the base request leveraged by this process
        baseRequest = b2cRequestLib.createRequestInstance(environmentDef);

        try {

            // Initialize and retrieve the administrative authTokens
            multiCloudInitResults = await useCaseProcesses.multiCloudInit(environmentDef);

            // Shorthand the B2C administrative authToken
            b2cAdminAuthToken = multiCloudInitResults.b2cAdminAuthToken

            // Audit the authorization token for future rest requests
            sfdcAuthCredentials = multiCloudInitResults.sfdcAuthCredentials;

            // Purge the customer data in B2C Commerce and SFDC
            await useCaseProcesses.b2cCustomerPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

            // Ensure that b2c-crm-sync is disabled in the specified environment
            await useCaseProcesses.b2cCRMSyncDisable(environmentDef, b2cAdminAuthToken, siteId);

        } catch (e) {

            // Audit the error if one is thrown
            throw new Error(e);

        }

    });

    it('does not create a SFDC Account / Contact when B2C-CRM-Sync is disabled', async function () {

        // Initialize the output scope
        let output = {};

        // Retrieve the guestAuthorization token from B2C Commerce
        output.b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        ////////////////////////////////////////////////////////////////
        // Validate that the B2C Customer Profile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cRegisterResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cRegisterResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cRegisterResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isFalse(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to not see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isFalse(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to not see the c_b2ccrm_contactId property in the B2C Commerce response');

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        ////////////////////////////////////////////////////////////////
        // Verify that no SFDC attributes are decorated on the B2C Profile
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cAuthResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cAuthResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cAuthResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isFalse(output.b2cAuthResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to not see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isFalse(output.b2cAuthResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to not see the c_b2ccrm_contactId property in the B2C Commerce response');

    });

    it('successfully creates a SFDC Account / Contact when B2C-CRM-Sync is enabled', async function () {

        // Initialize the output scope
        let output = {};

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegistrationResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer
        registeredB2CCustomerNo = output.b2cRegistrationResults.data.customer_no;

        ////////////////////////////////////////////////////////////////
        // Validate that the B2C Customer Profile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cRegistrationResults.status, 200, ` -- expected a 200 status code from B2C Commerce \n${JSON.stringify(output.b2cRegistrationResults.data)}`);
        assert.isTrue(output.b2cRegistrationResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cRegistrationResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isFalse(output.b2cRegistrationResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to not see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isFalse(output.b2cRegistrationResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to not see the c_b2ccrm_contactId property in the B2C Commerce response');

        // Ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Register the B2C Commerce customer profile
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cAuthenticationResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cAuthenticationResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cAuthenticationResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isTrue(output.b2cAuthenticationResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isTrue(output.b2cAuthenticationResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        ////////////////////////////////////////////////////////////////
        // Validate that the customerProfile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the SFDC Contact record exists and contains key properties
        assert.equal(output.sfdcContactResults.success, true, ' -- expected the success flag to have a value of true');
        assert.isTrue(output.sfdcContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
        assert.equal(output.sfdcContactResults.Id, output.b2cAuthenticationResults.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
        assert.equal(output.sfdcContactResults.AccountId, output.b2cAuthenticationResults.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

        // Validate that the email address and customerId attributes is aligned across both records
        assert.equal(output.sfdcContactResults.B2C_Customer_ID__c, output.b2cAuthenticationResults.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
        assert.equal(output.sfdcContactResults.Email, output.b2cAuthenticationResults.data.email, ' -- SFDC and B2C Email Addresses attributes do not match');

    });

    it('successfully triggers a profile property update to the mapped SFDC Contact when sync-on-login is enabled', async function() {

        // Initialize the output scope
        let output = {};

        // Get the profile-update template used to drive the B2C Commerce profile update
        let profileUpdate = config.util.toObject(config.get('unitTests.testData.updateTemplate'));

        // Ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegistrationResults = await shopAPIs.customerPost(
            environmentDef, siteId, environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer
        registeredB2CCustomerNo = output.b2cRegistrationResults.data.customer_no;

        ////////////////////////////////////////////////////////////////
        // Validate that the B2C Customer Profile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cRegistrationResults.status, 200, ` -- expected a 200 status code from B2C Commerce\n${JSON.stringify(output.b2cRegistrationResults.data)}`);
        assert.isTrue(output.b2cRegistrationResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cRegistrationResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isTrue(output.b2cRegistrationResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isTrue(output.b2cRegistrationResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

        // Update the contact properties via the Data API so as not to trigger an update to SFDC
        output.b2cPatchResults = await dataAPIs.customerPatch(
            baseRequest, b2cAdminAuthToken, customerListId, output.b2cRegistrationResults.data.customer_no, profileUpdate);

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cPatchResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cPatchResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.isTrue(output.b2cPatchResults.data.hasOwnProperty('job_title'), ' -- expected to see the job_title property in the B2C Commerce response');
        assert.isTrue(output.b2cPatchResults.data.hasOwnProperty('phone_home'), ' -- expected to see the home_phone property in the B2C Commerce response');

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cPatchResults.data.c_b2ccrm_contactId);

        ////////////////////////////////////////////////////////////////
        // Validate that the patched properties were not sent to SFDC
        ////////////////////////////////////////////////////////////////

        // Validate that the SFDC Contact record exists and contains key properties
        assert.equal(output.sfdcContactResults.success, true, ' -- expected the success flag to have a value of true');
        assert.isTrue(output.sfdcContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
        assert.notEqual(output.sfdcContactResults.B2C_Job_Title__c, output.b2cPatchResults.data.job_title, ' -- SFDC and B2C job-title attributes do not match');
        assert.notEqual(output.sfdcContactResults.HomePhone, output.b2cPatchResults.data.phone_home, ' -- SFDC and B2C home phone attributes do not match');

        // Authenticate as the B2C Commerce Customer
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cAuthenticationResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cAuthenticationResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');

        // Retrieve the contact details from the SFDC environment
        output.sfdcUpdatedContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        ////////////////////////////////////////////////////////////////
        // Validate that the patched properties were sent to SFDC
        ////////////////////////////////////////////////////////////////

        // Validate that the SFDC Contact record exists and contains key properties
        assert.equal(output.sfdcUpdatedContactResults.success, true, ' -- expected the success flag to have a value of true');
        assert.isTrue(output.sfdcUpdatedContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
        assert.notEqual(output.sfdcUpdatedContactResults.B2C_Job_Title__c, output.b2cAuthenticationResults.data.job_title, ' -- SFDC and B2C job-title attributes do not match');
        assert.notEqual(output.sfdcUpdatedContactResults.HomePhone, output.b2cAuthenticationResults.data.phone_home, ' -- SFDC and B2C home phone attributes do not match');

    });

    // Reset the output variable in-between tests
    afterEach( async function() {

        // Purge the customer data in B2C Commerce and SFDC
        await useCaseProcesses.b2cCustomerPurgeByCustomerNo(b2cAdminAuthToken, sfdcAuthCredentials.conn, registeredB2CCustomerNo);

        // Ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncDisable(environmentDef, b2cAdminAuthToken, siteId);

    });

    // Reset the output variable in-between tests
    after( async function() {

        // Purge the customer data in B2C Commerce and SFDC
        await useCaseProcesses.b2cCustomerPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

    });

});
