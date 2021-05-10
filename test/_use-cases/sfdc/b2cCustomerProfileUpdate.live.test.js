'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries for B2C Commerce
const dataAPIs = require('../../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../../lib/_common/request');

// Initialize tearDown helpers
const useCaseProcesses = require('../../_common/processes');
const common = require('../_common');

// Initialize local libraries for SFDC
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize local libraries
const getRuntimeEnvironment = require('../../../lib/cli-api/_getRuntimeEnvironment');

describe('Updating an SFDC Contact representing a B2C Commerce Customer Profile from within SFDC', function () {

    // Establish a thirty-second time-out or multi-cloud unit tests
    // noinspection JSAccessibilityCheck
    this.timeout(config.get('unitTests.testData.describeTimeout'));

    // Configure the total number of retries supported per test
    // noinspection JSAccessibilityCheck
    this.retries(config.get('unitTests.testData.testRetryCount'));

    // Initialize local variables
    let environmentDef,
        disablePurge,
        baseRequest,
        initResults,
        testProfile,
        testEmail,
        profileUpdate,
        customerListId,
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

        // Retrieve the site and customerList used to testing
        customerListId = config.get('unitTests.testData.b2cCustomerList').toString();
        siteId = config.util.toObject(config.get('unitTests.testData.b2cSiteCustomerLists'))[customerListId];

        // Generate a random email to leverage for profiles
        testEmail = common.getEmailForTestProfile();

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
        profileUpdate = config.util.toObject(config.get('unitTests.testData.updateTemplate'));

        // Update the email address with a random email
        testProfile.customer.email = testEmail;
        testProfile.customer.login = testEmail;

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

    it('successfully updates a B2C Commerce Profile with changes initiated from SFDC when integration is enabled', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Validate that the B2C Customer Profile was successfully created with SFDC attributes
        common.validateRegisteredUserWithSFDCAttributes(output.b2cRegisterResults.response);

        // Implement a pause to allow the PlatformEvent to fire
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Update the B2C Commerce properties for the related contactRecord
        output.sfdcContactResults = await sObjectAPIs.update(sfdcAuthCredentials.conn,
            'Contact', {
                Id: output.b2cRegisterResults.response.data.c_b2ccrm_contactId,
                B2C_Job_Title__c: profileUpdate.job_title,
                HomePhone: profileUpdate.phone_home
            });

        // Implement a pause to allow the PlatformEvent to fire
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Retrieve the B2C Customer details to validate and compare results
        output.b2cCustomerProfileResults = await dataAPIs.customerGet(
            baseRequest, b2cAdminAuthToken, customerListId, output.b2cRegisterResults.response.data.customer_no);

        // Verify that the Contact record's properties are aligned with the B2C Commerce Profile
        common.validateRegisteredUserContactUpdatesAreEqual(
            output.sfdcContactResults,
            output.b2cCustomerProfileResults
        );

    });

    it('does not process updates to a B2C Commerce Profile with changes initiated from SFDC when integration is disabled', async function () {

        // Initialize the output scope
        let output = {};

        // First, ensure that b2c-crm-sync is disabled in the specified environment
        await useCaseProcesses.b2cCRMSyncConfigManager(environmentDef, b2cAdminAuthToken, siteId, syncGlobalEnable);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Register the B2C Commerce customer profile using the current set of configuration properties
        output.b2cRegisterResults = await useCaseProcesses.b2cCustomerRegister(environmentDef, b2cAdminAuthToken, siteId, testProfile);

        // Validate that the B2C Customer Profile was successfully created with SFDC attributes
        common.validateRegisteredUserWithSFDCAttributes(output.b2cRegisterResults.response);

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Disable b2c-crm-sync integration on the Contact record
        output.sfdcDisableIntegrationContactResults = await sObjectAPIs.update(sfdcAuthCredentials.conn,
            'Contact', {
                Id: output.b2cRegisterResults.response.data.c_b2ccrm_contactId,
                B2C_Disable_Integration__c: true
            });

        // Implement a pause to allow the B2C Commerce environment to set
        await useCaseProcesses.sleep(sleepTimeout);

        // Update the B2C Commerce properties for the related contactRecord
        output.sfdcContactResults = await sObjectAPIs.update(sfdcAuthCredentials.conn,
            'Contact', {
                Id: output.b2cRegisterResults.response.data.c_b2ccrm_contactId,
                B2C_Job_Title__c: profileUpdate.job_title,
                HomePhone: profileUpdate.phone_home
            });

        // Implement a pause to allow the PlatformEvent to fire (it should not)
        await useCaseProcesses.sleep(sleepTimeout);
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the contact details from the SFDC environment
        output.sfdcContactResults = await sObjectAPIs.retrieve(sfdcAuthCredentials.conn,
            'Contact', output.b2cRegisterResults.response.data.c_b2ccrm_contactId);

        // Implement a pause to allow the PlatformEvent to fire (it should not)
        await useCaseProcesses.sleep(sleepTimeout);

        // Retrieve the B2C Customer details to validate and compare results
        output.b2cCustomerProfileResults = await dataAPIs.customerGet(
            baseRequest, b2cAdminAuthToken, customerListId, output.b2cRegisterResults.response.data.customer_no);

        // Verify that the Contact record's properties are not aligned with the B2C Commerce Profile
        common.validateRegisteredUserContactUpdatesAreNotEqual(
            output.sfdcContactResults,
            output.b2cCustomerProfileResults
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
