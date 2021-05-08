'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries for B2C Commerce
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');
const common = require('../_common');

// Initialize local libraries for SFDC
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

describe('Authenticating a B2C Customer Profile via the OCAPI Shop API', function () {

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
        purgeSleepTimeout,
        pauseSleepTimeout,
        miniSleepTimeout;

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
        pauseSleepTimeout = purgeSleepTimeout / 2;
        miniSleepTimeout = pauseSleepTimeout / 2;

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Generate a random email to leverage for profiles
        testEmail = common.getEmailForTestProfile();

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
        profileUpdate = config.util.toObject(config.get('unitTests.testData.updateTemplate'));
        profileUpdateAlt = config.util.toObject(config.get('unitTests.testData.updateTemplateAlt'));

        // Update the email address with a random email
        testProfile.customer.email = testEmail;

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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults);

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the B2C Customer Profile was successfully created
        common.validateRegisteredUserNoSFDCAttributes(output.b2cAuthResults);

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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Register the B2C Commerce customer profile
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        common.validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults);

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the B2C Customer Profile was successfully created
        common.validateRegisteredUserNoSFDCAttributes(output.b2cAuthResults);

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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment with sync-once disabled
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncEnabledSyncOnceDisabled);

        // Implement a pause to allow the configuration to update
        await useCaseProcesses.sleep(miniSleepTimeout);

        // Authenticate the B2C Commerce customer via OCAPI
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        common.validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

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
        common.validateRegisteredUserContactUpdatesAreEqual(
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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment with sync-once disabled
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Authenticate the B2C Commerce customer via OCAPI
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        common.validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

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
        common.validateRegisteredUserContactUpdatesAreNotEqual(
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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults);

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Register the B2C Commerce customer profile
        output.b2cAuthResults = await shopAPIs.authAsRegistered(environmentDef, siteId,
            environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the B2C Customer Profile was successfully created
        common.validateRegisteredUserNoSFDCAttributes(output.b2cAuthResults);

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
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegistrationResults);

        // Ensure that b2c-crm-sync is enabled in the specified environment to support authentication
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Authenticate the B2C Commerce customer via OCAPI
        output.b2cAuthenticationResults = await shopAPIs.authAsRegistered(
            environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

        // Validate that the registration is well-formed and contains the key properties we expect
        common.validateRegisteredUserWithSFDCAttributes(output.b2cAuthenticationResults);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cAuthenticationResults.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cAuthenticationResults);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cAuthenticationResults);

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
        common.validateRegisteredUserContactUpdatesAreNotEqual(
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
    common.validateRegisteredUserPatchResults(output.b2cPatchResults);

    // Implement a pause to ensure the PlatformEvent fires
    await useCaseProcesses.sleep(sleepTimeout / 4);

    // Re-authenticate the B2C Commerce customer via OCAPI (to validate the update works)
    output.b2cFirstUpdateAuthenticationResults = await shopAPIs.authAsRegistered(
        environmentDef, siteId, environmentDef.b2cClientId, testProfile.customer.login, testProfile.password);

    // Validate that the authentication returned the expected results
    common.validateRegisteredUserWithSFDCAttributes(output.b2cFirstUpdateAuthenticationResults);

    // Implement a pause to ensure the PlatformEvent fires
    await useCaseProcesses.sleep(sleepTimeout);

    // Retrieve the contact details from the SFDC environment
    output.sfdcUpdateContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
        'Contact', output.b2cFirstUpdateAuthenticationResults.data.c_b2ccrm_contactId);

    // Return the output variable
    return output;

}
