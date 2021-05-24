'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries for B2C Commerce
const shopAPIs = require('../../../lib/apis/sfcc/ocapi/shop');

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');
const common = require('../_common');

// Initialize local libraries for SFDC
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

describe('Registering a new B2C Customer Profile via the OCAPI Shop API', function () {

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
        b2cAdminAuthToken,
        sfdcAuthCredentials,
        syncGlobalEnable,
        syncDisableOCAPI,
        syncDisableOnLogin,
        syncDisableCustomers,
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
        testProfile.customer.login = testEmail;

        // Default the sync-configuration to leverage; sync-on-login and sync-once are enabled
        syncGlobalEnable = config.get('unitTests.b2cCRMSyncConfigManager.base');
        syncDisableOCAPI = config.get('unitTests.b2cCRMSyncConfigManager.disableOCAPI');
        syncDisableOnLogin = config.get('unitTests.b2cCRMSyncConfigManager.disableSyncOnLogin');
        syncDisableCustomers = config.get('unitTests.b2cCRMSyncConfigManager.disableCustomers');

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

    it('does not create a SFDC Contact when b2c-crm-sync is disabled for a storefront', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Implement a pause after setting the configuration settings
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Validate that the B2C Customer Profile was successfully created without SFDC attributes
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults.response);

    });

    it('successfully creates a new SFDC Contact when b2c-crm-sync is enabled', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Validate that the B2C Customer Profile was successfully created with SFDC attributes
        common.validateRegisteredUserWithSFDCAttributes(output.b2cRegisterResults.response);

    });

    it('does not create a SFDC Contact when sync-customers is disabled', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableCustomers);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Validate that the B2C Customer Profile was successfully created without SFDC attributes
        common.validateRegisteredUserNoSFDCAttributes(output.b2cRegisterResults.response);

    });

    it('allows multiple updates to a SFDC Contact via B2C Commerce profile updates', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);
        if (!output.b2cRegisterResults.response.data.c_b2ccrm_contactId) {
            await useCaseProcesses.sleep(sleepTimeout);
            await useCaseProcesses.sleep(sleepTimeout);
        }

        // Retrieve the SFDC Contact record that corresponds to the B2C Commerce customer record
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cRegisterResults.response);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cRegisterResults.response);

        // Update the customer's profile via the shopAPI
        output.b2cFirstProfileUpdateResults = await shopAPIs.customerPatch(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cRegisterResults.response.authToken, output.b2cRegisterResults.response.data.customer_id, profileUpdate);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Verify that the update was successfully processed
        common.validateRegisteredUserPatchResults(output.b2cFirstProfileUpdateResults);

        // Retrieve the contact details from the SFDC environment
        output.sfdcFirstContactUpdateResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        common.validateRegisteredUserContactUpdatesAreEqual(
            output.sfdcFirstContactUpdateResults,
            output.b2cFirstProfileUpdateResults
        );

        // Update the customer's profile via the shopAPI
        output.b2cSecondProfileUpdateResults = await shopAPIs.customerPatch(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cRegisterResults.response.authToken, output.b2cRegisterResults.response.data.customer_id, profileUpdateAlt);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Verify that the update was successfully processed
        common.validateRegisteredUserPatchResults(output.b2cSecondProfileUpdateResults);

        // Retrieve the contact details from the SFDC environment
        output.sfdcSecondContactUpdateResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        common.validateRegisteredUserContactUpdatesAreEqual(
            output.sfdcSecondContactUpdateResults,
            output.b2cSecondProfileUpdateResults
        );

    });

    it('does not allow updates to a SFDC Contact via B2C Commerce when b2c-crm-sync is disabled', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);
        if (!output.b2cRegisterResults.response.data.c_b2ccrm_contactId) {
            await useCaseProcesses.sleep(sleepTimeout);
            await useCaseProcesses.sleep(sleepTimeout);
        }

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cRegisterResults.response);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cRegisterResults.response);

        // Now, ensure that b2c-crm-sync is disabled globally in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOCAPI);

        // Implement a pause to ensure the environment details update
        await useCaseProcesses.sleep(sleepTimeout);

        // Update the customer's profile via the shopAPI
        output.b2cFirstProfileUpdateResults = await shopAPIs.customerPatch(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cRegisterResults.response.authToken, output.b2cRegisterResults.response.data.customer_id, profileUpdate);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Verify that the update was successfully processed
        common.validateRegisteredUserPatchResults(output.b2cFirstProfileUpdateResults);

        // Retrieve the contact details from the SFDC environment
        output.sfdcFirstContactUpdateResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        common.validateRegisteredUserContactUpdatesAreNotEqual(
            output.sfdcFirstContactUpdateResults,
            output.b2cFirstProfileUpdateResults
        );

    });

    it('does not allow updates to SFDC Contact via B2C Commerce when sync-customers is disabled', async function () {

        // Initialize local variables
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableOnLogin);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Verify that the SFDC Contact and AccountIDs are aligned between the Contact and B2C Commerce Profile
        common.validateContactAndAccountIDs(output.sfdcContactResults, output.b2cRegisterResults.response);

        // Verify that the B2C Commerce CustomerID and CustomerNo are aligned between the Contact and B2C Commerce Profile
        common.validateB2CIdentifiers(output.sfdcContactResults, output.b2cRegisterResults.response);

        // Now, ensure that b2c-crm-sync is disabled globally in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncDisableCustomers);

        // Implement a pause to ensure the environment details update
        await useCaseProcesses.sleep(sleepTimeout);

        // Update the customer's profile via the shopAPI
        output.b2cFirstProfileUpdateResults = await shopAPIs.customerPatch(environmentDef, siteId,
            environmentDef.b2cClientId, output.b2cRegisterResults.response.authToken, output.b2cRegisterResults.response.data.customer_id, profileUpdate);

        // Implement a pause to ensure the PlatformEvent fires
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Verify that the update was successfully processed
        common.validateRegisteredUserPatchResults(output.b2cFirstProfileUpdateResults);

        // Retrieve the contact details from the SFDC environment
        output.sfdcFirstContactUpdateResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Validate that the SFDC Contact attributes do not match their B2C Commerce equivalents
        common.validateRegisteredUserContactUpdatesAreNotEqual(
            output.sfdcFirstContactUpdateResults,
            output.b2cFirstProfileUpdateResults
        );

    });

    // Reset the output variable in-between tests
    afterEach(async function () {

        // Attempt to remove any stray and domain-specific customer records from B2C Commerce and the Salesforce Platform
        await useCaseProcesses.b2cCRMSyncCustomersPurgeManager(disablePurge, purgeSleepTimeout, b2cAdminAuthToken, sfdcAuthCredentials);

    });

    // Reset the output variable in-between tests
    after(async function () {

        // Next, ensure that b2c-crm-sync is enabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

    });

});
