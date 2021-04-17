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
    // noinspection JSAccessibilityCheck
    this.timeout(60000);

    // Initialize local variables
    let environmentDef,
        initResults,
        testProfile,
        profileUpdate,
        profileUpdateAlt,
        customerListId,
        siteId,
        b2cGuestAuth,
        b2cAdminAuthToken,
        sfdcAuthCredentials,
        baseRequest,
        registeredB2CCustomerNo,
        syncGlobalEnable,
        syncDisableOCAPI,
        syncDisableOnLogin,
        syncEnabledSyncOnceDisabled,
        syncDisableCustomers,
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

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
        profileUpdate = config.util.toObject(config.get('unitTests.testData.updateTemplate'));
        profileUpdateAlt = config.util.toObject(config.get('unitTests.testData.updateTemplateAlt'));

        // Default the sync-configuration to leverage; sync-on-login and sync-once are enabled
        syncGlobalEnable = config.get('unitTests.b2cCRMSyncConfigManager.base');
        syncDisableOCAPI = config.get('unitTests.b2cCRMSyncConfigManager.disableOCAPI');
        syncDisableOnLogin = config.get('unitTests.b2cCRMSyncConfigManager.disableSyncOnLogin');
        syncEnabledSyncOnceDisabled = config.get('unitTests.b2cCRMSyncConfigManager.disableSyncOnce');
        syncDisableCustomers = config.get('unitTests.b2cCRMSyncConfigManager.disableCustomers');

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

    it('does not create a SFDC Contact when b2c-crm-sync is disabled for a storefront', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Retrieve the guestAuthorization token from B2C Commerce
        output.b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        // Validate that the B2C Customer Profile was successfully created
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults);

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the B2C Customer Profile was successfully created
        _validateRegisteredUserNoSFDCAttributes(output.b2cAuthResults);

    });

    it('successfully creates a new SFDC Contact when sync-on-login and sync-once is enabled', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegistrationResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegistrationResults.data.customer_no;

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Register the B2C Commerce customer profile
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        _validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        _validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

    });

    it('does not create a SFDC Contact when sync-on-login is disabled', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Retrieve the guestAuthorization token from B2C Commerce
        output.b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        // Validate that the B2C Customer Profile was successfully created
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults);

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the B2C Customer Profile was successfully created
        _validateRegisteredUserNoSFDCAttributes(output.b2cAuthResults);

    });

    it('allows multiple updates to a SFDC Contact when sync-on-login is enabled and sync-once is disabled', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegistrationResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegistrationResults.data.customer_no;

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment with sync-once disabled
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncEnabledSyncOnceDisabled);

        // Authenticate the B2C Commerce customer via OCAPI
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        _validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        _validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Perform and validate that updates to b2C Commerce profiles do not update SFDC Contacts on-login
        output.firstUpdateResults = await _performB2CCommerceProfileUpdateAndRetrieveSFDCContact(
            environmentDef,
            output.b2cRegistrationResults,
            profileUpdate,
            testProfile,
            baseRequest,
            b2cAdminAuthToken,
            sfdcAuthCredentials,
            customerListId,
            siteId,
            sleepTimeout
        );

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        _validateRegisteredUserContactUpdatesAreEqual(
            output.firstUpdateResults.sfdcUpdateContactResults,
            output.firstUpdateResults.b2cFirstUpdateAuthenticationResults
        );

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Perform and validate that updates to b2C Commerce profiles do not update SFDC Contacts on-login
        output.secondUpdateResults = await _performB2CCommerceProfileUpdateAndRetrieveSFDCContact(
            environmentDef,
            output.b2cRegistrationResults,
            profileUpdateAlt,
            testProfile,
            baseRequest,
            b2cAdminAuthToken,
            sfdcAuthCredentials,
            customerListId,
            siteId,
            sleepTimeout
        );

    });

    it('does not allow updates to a SFDC Contact when sync-on-login is enabled and sync-once is enabled', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegistrationResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegistrationResults.data.customer_no;

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment with sync-once disabled
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Authenticate the B2C Commerce customer via OCAPI
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        _validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        _validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Perform and validate that updates to b2C Commerce profiles do not update SFDC Contacts on-login
        output.updateResults = await _performB2CCommerceProfileUpdateAndRetrieveSFDCContact(
            environmentDef,
            output.b2cRegistrationResults,
            profileUpdate,
            testProfile,
            baseRequest,
            b2cAdminAuthToken,
            sfdcAuthCredentials,
            customerListId,
            siteId,
            sleepTimeout
        );

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        _validateRegisteredUserContactUpdatesAreNotEqual(
            output.updateResults.sfdcUpdateContactResults,
            output.updateResults.b2cFirstUpdateAuthenticationResults
        );

    });

    it('does not create a SFDC Contact when sync-customers is disabled', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableCustomers);

        // Retrieve the guestAuthorization token from B2C Commerce
        output.b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegisterResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegisterResults.data.customer_no;

        // Validate that the B2C Customer Profile was successfully created
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults);

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the B2C Customer Profile was successfully created
        _validateRegisteredUserNoSFDCAttributes(output.b2cAuthResults);

    });

    it('does not allow updates to a SFDC Contact with sync-customers is disabled', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.b2cRegistrationResults = await shopAPIs.customerPost(environmentDef, siteId,
            environmentDef.b2cClientId, b2cGuestAuth.authToken, testProfile);

        // Audit the customerNo of the newly registered customer to that we can
        // delete this customer record as part of the tear-down process
        registeredB2CCustomerNo = output.b2cRegistrationResults.data.customer_no;

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment to support authentication
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Authenticate the B2C Commerce customer via OCAPI
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        _validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        _validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        _validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Ensure that b2c-crm-sync is enabled but that sync-customers is disabled
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableCustomers);

        // Perform and validate that updates to b2C Commerce profiles do not update SFDC Contacts on-login
        output.updateResults = await _performB2CCommerceProfileUpdateAndRetrieveSFDCContact(
            environmentDef,
            output.b2cRegistrationResults,
            profileUpdate,
            testProfile,
            baseRequest,
            b2cAdminAuthToken,
            sfdcAuthCredentials,
            customerListId,
            siteId,
            sleepTimeout
        );

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        _validateRegisteredUserContactUpdatesAreNotEqual(
            output.updateResults.sfdcUpdateContactResults,
            output.updateResults.b2cFirstUpdateAuthenticationResults
        );


    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(purgeSleepTimeout);

        // Purge the customer data in B2C Commerce and SFDC
        await useCaseProcesses.b2cCustomerPurgeByCustomerNo(b2cAdminAuthToken, sfdcAuthCredentials.conn, registeredB2CCustomerNo);

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
 * @function _performB2CCommerceProfileUpdateAndRetrieveSFDCContact
 * @description Helper function to process and retrieve the corresponding B2C Commerce and SFDC Contact records
 * so that they can be evaluated for test scenarios as part of the authentication unit-tests.
 *
 * @param environmentDef {Object} Represents the active / working environment definition
 * @param b2cAuthResults {Object} Represents the authentication results of the B2C Commerce customer profile's 1st login
 * @param profileDetails {Object} Represents the individual profile details used to drive / test the update
 * @param testProfile {Object} Represents the B2C Commerce mock-customer profile
 * @param b2cBaseRequest {Object} Represents the base B2C Commerce Axios request (used for future requests)
 * @param b2cAdminAuthToken {String} Represents the b2c client-credential authToken used for REST API access
 * @param sfdcAuthCredentials {connection} Auth credentials / connection information for SFDC REST API access
 * @param customerListId {String} Represents the customerList used during testing
 * @param siteId {String} Describes the current site being exercised
 * @param sleepTimeout {Integer} Represents the timout in-between requests to allow async processes to complete
 * @return {Object} Returns an object containing the output variables captured during execution
 */
async function _performB2CCommerceProfileUpdateAndRetrieveSFDCContact(environmentDef, b2cAuthResults, profileDetails, testProfile, b2cBaseRequest, b2cAdminAuthToken, sfdcAuthCredentials, customerListId, siteId, sleepTimeout) {

    // Initialize local variables
    let output = {};

    // Update the contact properties via the Data API so as not to trigger an update to SFDC
    output.b2cPatchResults = await dataAPIs.customerPatch(
        b2cBaseRequest, b2cAdminAuthToken, customerListId, b2cAuthResults.data.customer_no, profileDetails);

    // Validate that patch results were successfully processed against the registered user
    _validateRegisteredUserPatchResults(output.b2cPatchResults);

    // Re-authenticate the B2C Commerce customer via OCAPI (to validate the update works)
    output.b2cFirstUpdateAuthenticationResults = await shopAPIs.authAsRegistered(
        environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

    // Validate that the authentication returned the expected results
    _validateRegisteredUserWithSFDCAttributes(output.b2cFirstUpdateAuthenticationResults);

    // Implement a pause to ensure the PlatformEvent fires
    await useCaseProcesses.sleep(sleepTimeout);

    // Retrieve the contact details from the SFDC environment
    output.sfdcUpdateContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
        'Contact', output.b2cFirstUpdateAuthenticationResults.data.c_b2ccrm_contactId);

    // Return the output variable
    return output;

}

/**
 * @private
 * @function _validateRegisteredUserNoSFDCAttributes
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that SFDC attributes are not created on a B2C Customer Profile
 *
 * @param {Object} b2cRegResults Represents the registration / authentication results for a given unit-test being evaluated
 */
function _validateRegisteredUserNoSFDCAttributes(b2cRegResults) {

    // Validate that the registration is well-formed and contains the key properties we expect
    assert.equal(b2cRegResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
    assert.isTrue(b2cRegResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
    assert.equal(b2cRegResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
    assert.isFalse(b2cRegResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to not see the c_b2ccrm_accountId property in the B2C Commerce response');
    assert.isFalse(b2cRegResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to not see the c_b2ccrm_contactId property in the B2C Commerce response');

}

/**
 * @private
 * @function _validateRegisteredUserWithSFDCAttributes
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that SFDC attributes are created on a B2C Customer Profile
 *
 * @param {Object} b2cRegResults Represents the registration / authentication results for a given unit-test being evaluated
 */
function _validateRegisteredUserWithSFDCAttributes(b2cRegResults) {

    // Validate that the registration is well-formed and contains the key properties we expect
    assert.equal(b2cRegResults.status, 200, ' -- expected a 200 status code from B2C Commerce');
    assert.isTrue(b2cRegResults.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
    assert.equal(b2cRegResults.data.auth_type, 'registered', ' -- expected to see a registered B2C Commerce customer profile');
    assert.isTrue(b2cRegResults.data.hasOwnProperty('c_b2ccrm_accountId'), ' -- expected to see the c_b2ccrm_accountId property in the B2C Commerce response');
    assert.isTrue(b2cRegResults.data.hasOwnProperty('c_b2ccrm_contactId'), ' -- expected to see the c_b2ccrm_contactId property in the B2C Commerce response');

}

/**
 * @private
 * @function _validateWithB2CIdentifiers
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that B2C Commerce Profile and SFDC record have corresponding B2C identifiers
 *
 * @param sfdcContact {Object} Represents the SFDC Contact record being compared
 * @param b2cRegisteredUser {Object} Represents the B2C Commerce Customer Profile being compared
 */
function _validateB2CIdentifiers(sfdcContact, b2cRegisteredUser) {

    // Validate that the email address and customerId attributes is aligned across both records
    assert.equal(sfdcContact.B2C_Customer_ID__c, b2cRegisteredUser.data.customer_id, ' -- SFDC and B2C CustomerID attributes do not match');
    assert.equal(sfdcContact.B2C_Customer_No__c, b2cRegisteredUser.data.customer_no, ' -- SFDC and B2C CustomerNo attributes do not match');

}

/**
 * @private
 * @function _validateContactAndAccountIDs
 * @description Helper function to compare the SFDCContact with a RegisteredUser -- and validate that the
 * Contact and Account identifiers are aligned for the B2C Customer Profile and its mapped Contact record.
 *
 * @param sfdcContact {Object} Represents the SFDC Contact record being compared
 * @param b2cRegisteredUser {Object} Represents the B2C Commerce Customer Profile being compared
 */
function _validateContactAndAccountIDs(sfdcContact, b2cRegisteredUser) {

    // Validate that the SFDC Contact record exists and contains key properties
    assert.equal(sfdcContact.success, true, ' -- expected the success flag to have a value of true');
    assert.isTrue(sfdcContact.hasOwnProperty('Id'), ' -- expected to find an Id property on the SFDC Contact record');
    assert.equal(sfdcContact.Id, b2cRegisteredUser.data.c_b2ccrm_contactId, ' -- SFDC and B2C ContactID attributes do not match');
    assert.equal(sfdcContact.AccountId, b2cRegisteredUser.data.c_b2ccrm_accountId, ' -- SFDC and B2C AccountID attributes do not match');

}

/**
 * @private
 * @function _validateRegisteredUserPatchResults
 * @description Helper function to validate that a B2C Commerce Customer was successfully patched and their
 *
 * @param b2cRegisteredUser {Object} Represents the B2C Commerce Customer profile that was patched
 */
function _validateRegisteredUserPatchResults(b2cRegisteredUser) {

    // Validate that the registration is well-formed and contains the key properties we expect
    assert.equal(b2cRegisteredUser.status, 200, ' -- expected a 200 status code from B2C Commerce');
    assert.isTrue(b2cRegisteredUser.hasOwnProperty('data'), ' -- expected to find a data node in the B2C Commerce response');
    assert.isTrue(b2cRegisteredUser.data.hasOwnProperty('job_title'), ' -- expected to see the job_title property in the B2C Commerce response');
    assert.isTrue(b2cRegisteredUser.data.hasOwnProperty('phone_home'), ' -- expected to see the home_phone property in the B2C Commerce response');

}

/**
 * @private
 * @function _validateRegisteredUserContactUpdatesAreEqual
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that updated SFDC attributes match with their source B2C Commerce identifiers
 *
 * @param {Object} sfdcPatchResults Represents the patch / update results from working with the sfdc Contact record
 * @param {Object} b2cPatchResults Represents the patch / update results from working with the b2c Customer profile
 */
function _validateRegisteredUserContactUpdatesAreEqual(sfdcPatchResults, b2cPatchResults) {

    // Validate that the SFDC Contact record properties do not match with its B2C Commerce Customer Profile counterpart
    assert.equal(sfdcPatchResults.HomePhone, b2cPatchResults.data.phone_home, ' -- SFDC and B2C home phone attributes do not match (and they should)');
    assert.equal(sfdcPatchResults.B2C_Job_Title__c, b2cPatchResults.data.job_title, ' -- SFDC and B2C job-title attributes do not match (and they should)');

}

/**
 * @private
 * @function _validateRegisteredUserContactUpdatesAreNotEqual
 * @description Helper function to centralize validation / assertion logic for test-scenarios; this collection
 * of assertions are used to confirm that updated SFDC attributes do not match with their source B2C Commerce identifiers
 *
 * @param {Object} sfdcPatchResults Represents the patch / update results from working with the sfdc Contact record
 * @param {Object} b2cPatchResults Represents the patch / update results from working with the b2c Customer profile
 */
function _validateRegisteredUserContactUpdatesAreNotEqual(sfdcPatchResults, b2cPatchResults) {

    // Validate that the SFDC Contact record properties do not match with its B2C Commerce Customer Profile counterpart
    assert.notEqual(sfdcPatchResults.HomePhone, b2cPatchResults.data.phone_home, ' -- SFDC and B2C home phone attributes match (and they should not)');
    assert.notEqual(sfdcPatchResults.B2C_Job_Title__c, b2cPatchResults.data.job_title, ' -- SFDC and B2C job-title attributes match (and they should not)');

}
