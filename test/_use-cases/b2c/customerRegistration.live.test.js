'use strict';

// Initialize constants
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize local libraries for B2C Commerce
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');
const b2cRequestLib = require('../../../lib/_common/request');

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');

// Initialize local libraries for SFDC
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');
const metaDataAPIs = require('../../../lib/qa/processes/_common/sfdc/customMetaData');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

// Exercise the retrieval of the operation mode
describe('Registering a B2C Commerce Customer Profile with B2C-CRM-Sync enabled', function () {

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
    before(async function() {

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

    })

    it('successfully creates a B2C Commerce Customer Profile and a mapped SFDC Account / Contact', async function() {

        // Initialize the output scope
        let output = {};

        // Ensure that b2c-crm-sync is enabled for this specific unit-test
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(
            environmentDef, siteId, environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        ////////////////////////////////////////////////////////////////
        // Validate that the B2C Customer Profile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cRegisterResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cRegisterResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cRegisterResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isTrue(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isTrue(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

        ////////////////////////////////////////////////////////////////
        // Validate that the SFDC Account / Contact was successfully created
        ////////////////////////////////////////////////////////////////

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact record exists and contains key properties
        assert.equal(output.sfdcContactResults.success, true, ' -- expected the success flag to have a value of true');
        assert.isTrue(output.sfdcContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
        assert.equal(output.sfdcContactResults.Id, output.b2cRegisterResults.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
        assert.equal(output.sfdcContactResults.AccountId, output.b2cRegisterResults.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

        // Validate that the email address and customerId attributes is aligned across both records
        assert.equal(output.sfdcContactResults.B2C_Customer_ID__c, output.b2cRegisterResults.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
        assert.equal(output.sfdcContactResults.Email, output.b2cRegisterResults.data.email, ' -- SFDC and B2C Email Addresses attributes do not match');

    });

    it('successfully maps a B2C Commerce Profile to an Account / Contact by Email and LastName with no B2C CustomerList', async function() {

        // Initialize the output scope
        let output = {};

        ////////////////////////////////////////////////////////////////
        // Setup the Unmapped Account / Contact Relationship
        ////////////////////////////////////////////////////////////////

        // Get the default configuration for the scratchOrg
        output.defaultConfiguration = await metaDataAPIs.getDefaultConfiguration(sfdcAuthCredentials.conn);

        // Get the configuration properties
        output.configurationProperties = await metaDataAPIs.getConfigurationProperties(
            sfdcAuthCredentials.conn, output.defaultConfiguration.Active_Configuration__c);

        // Create an Account using the configured recordType
        output.accountCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Account', {
                Name: `${testProfile.customer.first_name} ${testProfile.customer.last_name}`,
                RecordType: output.configurationProperties.Account_Record_Type_Developername__c
            });

        // Create the Child Contact
        output.contactCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Contact', {
                AccountId: output.accountCreateResult.id,
                FirstName: testProfile.customer.first_name,
                LastName: testProfile.customer.last_name,
                Email: testProfile.customer.email
            });

        ////////////////////////////////////////////////////////////////
        // Attempt to register the B2C Commerce Customer Profile
        ////////////////////////////////////////////////////////////////

        // Ensure that b2c-crm-sync is enabled for this specific unit-test
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(
            environmentDef, siteId, environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        ////////////////////////////////////////////////////////////////
        // Validate that the B2C Customer Profile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cRegisterResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cRegisterResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cRegisterResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isTrue(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isTrue(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

        ////////////////////////////////////////////////////////////////
        // Validate that the SFDC Account / Contact was successfully mapped
        ////////////////////////////////////////////////////////////////

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact record exists and contains key properties
        assert.equal(output.sfdcContactResults.success, true, ' -- expected the success flag to have a value of true');
        assert.isTrue(output.sfdcContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
        assert.equal(output.sfdcContactResults.Id, output.b2cRegisterResults.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
        assert.equal(output.sfdcContactResults.Id, output.contactCreateResult.id, ' -- SFDC and B2C ContactID attributes do not match with the original Contact record (contactCreateResult)');
        assert.equal(output.sfdcContactResults.AccountId, output.b2cRegisterResults.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

        // Validate that the email address and customerId attributes is aligned across both records
        assert.equal(output.sfdcContactResults.B2C_Customer_ID__c, output.b2cRegisterResults.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
        assert.equal(output.sfdcContactResults.Email, output.b2cRegisterResults.data.email, ' -- SFDC and B2C Email Addresses attributes do not match');

    });

    it('successfully maps a B2C Commerce Profile to an Account / Contact by CustomerList, Email, and Default LastName', async function() {

        // Initialize the output scope
        let output = {};

        ////////////////////////////////////////////////////////////////
        // Setup the Unmapped Account / Contact Relationship
        ////////////////////////////////////////////////////////////////

        // Get the default configuration for the scratchOrg
        output.defaultConfiguration = await metaDataAPIs.getDefaultConfiguration(sfdcAuthCredentials.conn);

        // Get the configuration properties
        output.configurationProperties = await metaDataAPIs.getConfigurationProperties(
            sfdcAuthCredentials.conn, output.defaultConfiguration.Active_Configuration__c);

        // Create an Account using the configured recordType
        output.accountCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Account', {
                Name: output.configurationProperties[0].Default_Account_Name__c,
                RecordType: output.configurationProperties.Account_Record_Type_Developername__c
            });

        // Create the Child Contact
        output.contactCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Contact', {
                AccountId: output.accountCreateResult.id,
                LastName: output.configurationProperties[0].Default_Contact_Name__c,
                Email: testProfile.customer.email,
                B2C_CustomerList_ID__c: customerListId
            });

        ////////////////////////////////////////////////////////////////
        // Attempt to register the B2C Commerce Customer Profile
        ////////////////////////////////////////////////////////////////

        // Ensure that b2c-crm-sync is enabled for this specific unit-test
        await useCaseProcesses.b2cCRMSyncEnable(environmentDef, b2cAdminAuthToken, siteId);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(
            environmentDef, siteId, environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        ////////////////////////////////////////////////////////////////
        // Validate that the B2C Customer Profile was successfully created
        ////////////////////////////////////////////////////////////////

        // Validate that the registration is well-formed and contains the key properties we expect
        assert.equal(output.b2cRegisterResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
        assert.isTrue(output.b2cRegisterResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
        assert.equal(output.b2cRegisterResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
        assert.isTrue(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
        assert.isTrue(output.b2cRegisterResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

        ////////////////////////////////////////////////////////////////
        // Validate that the SFDC Account / Contact was successfully mapped
        ////////////////////////////////////////////////////////////////

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact record exists and contains key properties
        assert.equal(output.sfdcContactResults.success, true, ' -- expected the success flag to have a value of true');
        assert.isTrue(output.sfdcContactResults.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
        assert.equal(output.sfdcContactResults.Id, output.b2cRegisterResults.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
        assert.equal(output.sfdcContactResults.Id, output.contactCreateResult.id, ' -- SFDC and B2C ContactID attributes do not match with the original Contact record (contactCreateResult)');
        assert.equal(output.sfdcContactResults.AccountId, output.b2cRegisterResults.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

        // Validate that the email address and customerId attributes is aligned across both records
        assert.equal(output.sfdcContactResults.B2C_Customer_ID__c, output.b2cRegisterResults.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
        assert.equal(output.sfdcContactResults.Email, output.b2cRegisterResults.data.email, ' -- SFDC and B2C Email Addresses attributes do not match');

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
