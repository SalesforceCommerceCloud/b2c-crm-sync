'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const sfdcAuth = require('../../../lib/apis/sfdc/auth');
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

// Initialize supporting functions
const contactAPIs = require('../../../lib/qa/processes/_common/sfdc/contact');
const metaDataAPIs = require('../../../lib/qa/processes/_common/sfdc/customMetaData');
const accountAPIs = require('../../../lib/qa/processes/_common/sfdc/account');

/**
 * @function sfdcCustomerProfiles
 * @description This function is used retrieve and manage customerProfiles on the Salesforce
 * Platform as Accounts / Contacts or PersonAccounts.
 *
 * @param {Object} envDef Represents the current environment definition used to process testing
 * @param {String} customerListId Represents the current customerList being used for testing
 * @returns {Promise} Returns the promise containing the request processing results
 */
module.exports = async (envDef, customerListId) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        testProfile,
        updateProfile,
        connection;

    // Audit the default attributes
    output = {
        baseStatus: {
            success: false,
            environmentDef: envDef,
            customerListId: customerListId
        }
    };

    try {

        // Retrieve the b2c customer profile template that we'll use to exercise this test
        testProfile = config.util.toObject(config.get('unitTests.testData.profileTemplate'));
        updateProfile = config.util.toObject(config.get('unitTests.testData.updateTemplate'));

        // -----------------------------------------------------------------
        // BEGIN: SFDC Customer Profile Gymnastics
        // -----------------------------------------------------------------

        // Audit the authorization token for future rest requests
        output.authResults = await sfdcAuth.authUserCredentials(
            envDef.sfLoginUrl, envDef.sfUsername, envDef.sfPassword, envDef.sfSecurityToken);

        // Default the authResults status and success flags
        if (Object.prototype.hasOwnProperty.call(output.authResults, 'accessToken')) {

            // Cache the authToken and connection
            connection = output.authResults.conn;

            // Set the status details
            output.authResults.success = true;

        } else {

            // Otherwise throw and error indicating that no connection was found
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('No connection found; inspect authResults for more details');

        }

        // Check if the org has a contact scoped with the test Contact
        output.contactSearchByCustomerListEmail = await contactAPIs.getByCustomerListEmail(
            connection, customerListId, testProfile.customer.email);

        // Was a Contact record found for the customerList / email combination?
        if (output.contactSearchByCustomerListEmail.length > 0) {

            // Delete the related accounts via their Contact associations
            output.accountDeleteResult = await accountAPIs.deleteAccountsContacts(
                connection, output.contactSearchByCustomerListEmail);

        }

        // Get the default configuration for the scratchOrg
        output.defaultConfiguration = await metaDataAPIs.getDefaultConfiguration(connection);

        // Get the configuration properties
        output.configurationProperties = await metaDataAPIs.getConfigurationProperties(
            connection, output.defaultConfiguration.Active_Configuration__c);

        // Create an Account using the configured recordType
        output.accountCreateResult = await sObjectAPIs.create(
            connection, 'Account', {
                Name: `${testProfile.customer.first_name} ${testProfile.customer.last_name}`,
                RecordType: output.configurationProperties.Account_Record_Type_Developername__c
            });

        // Create the Child Contact
        output.contactCreateResult = await sObjectAPIs.create(
            connection, 'Contact', {
                AccountId: output.accountCreateResult.id,
                B2C_CustomerList_ID__c: customerListId,
                FirstName: testProfile.customer.first_name,
                LastName: testProfile.customer.last_name,
                Email: testProfile.customer.email
            });

        // Set the job title for the contact
        output.contactJobTitleSetResult = await sObjectAPIs.update(
            connection, 'Contact', {
                Id: output.contactCreateResult.id,
                B2C_Job_Title__c: updateProfile.job_title
            });

        // Reset the job title for the contact
        output.contactJobTitleResetResult = await sObjectAPIs.update(
            connection, 'Contact', {
                Id: output.contactCreateResult.id,
                B2C_Job_Title__c: null
            });

        // Delete the parent Account and child Contact
        output.accountDeleteResult = await sObjectAPIs.destroy(
            connection, 'Account', output.accountCreateResult.id);

        // -----------------------------------------------------------------
        //   END: SFDC Customer Profile Gymnastics
        // -----------------------------------------------------------------

        // Audit the default attributes
        output.baseStatus.success = true;

        // Resolve the promise
        resolve(output);

    } catch (e) {

        // Capture the error
        output.error = e;
        output.stack = e.stack;

        // Reject the promise
        reject(output);

    }

});
