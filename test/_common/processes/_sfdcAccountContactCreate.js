'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');
const metaDataAPIs = require('../../../lib/qa/processes/_common/sfdc/customMetaData');
const recordTypeAPIs = require('../../../lib/qa/processes/_common/sfdc/recordType');
const b2cCustomerListAPIs = require('../../../lib/qa/processes/_common/sfdc/b2cCustomerList');

/**
 * @function sfdcAccountContactPurge
 * @description Helper function for B2C Customer profile / SFDC Account and Contact deletion.  This
 * function is used to remove our test-data records to ensure that no record-conflicts exist.
 *
 * @param {Connection} sfdcAuthCredentials Represents the active connection for SFDC provided via jsForce
 * @param {Object} contactObject Represents the contactObject to create
 * @param {String} accountName Represents the Account Name to leverage
 * @param {String} accountType Represents the type of account to create (Business or Person)
 * @param {Boolean} createDirectPersonAccount Describes if a personAccount should be created directly
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcAuthCredentials, contactObject, accountName, accountType, createDirectPersonAccount = false) => {

    // Initialize local variables
    let personAccountObj,
        b2cCustomerList,
        personAccountRecordTypeResults,
        personAccountRecordType,
        personAccountDeveloperName;

    // Initialize the output scope
    let output = {};

    // Look-up the personAccount developer name
    personAccountDeveloperName = config.get('unitTests.testData.personAccountDeveloperName').toString();

    // Was a customerListID found?  If so, then retrieve the parentId
    if (contactObject.hasOwnProperty('B2C_CustomerList_ID__c')) {

        // Retrieve the native B2C CustomerList
        b2cCustomerList = await b2cCustomerListAPIs.getByName(
            sfdcAuthCredentials.conn, contactObject.B2C_CustomerList_ID__c);

        // Create a reference to the retrieved customerList
        b2cCustomerList = b2cCustomerList[0];

        // Assign the customerList identifier to the contact object
        contactObject.B2C_CustomerList__c = b2cCustomerList.Id;

    }

    // Are PersonAccounts enabled for the scratchOrg?
    if (accountType === 'personaccounts' && createDirectPersonAccount === true) {

        // Initialize the personAccount object
        personAccountObj = {
            FirstName: contactObject.FirstName,
            LastName: contactObject.LastName,
            PersonEmail: contactObject.Email
        };

        // Was a customerListID found?  If so, then retrieve the parentId
        if (contactObject.hasOwnProperty('B2C_CustomerList_ID__c')) {

            // If so, then append the personAccount object with the customerList attributes
            personAccountObj.B2C_CustomerList__pc = contactObject.B2C_CustomerList__c;
            personAccountObj.B2C_CustomerList_ID__pc = contactObject.B2C_CustomerList_ID__c;

        }

        // Create an Account using the configured recordType
        output.accountCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Account', personAccountObj);

    } else {

        // Get the default configuration for the scratchOrg
        output.defaultConfiguration = await metaDataAPIs.getDefaultConfiguration(sfdcAuthCredentials.conn);

        // Get the configuration properties
        output.configurationProperties = await metaDataAPIs.getConfigurationProperties(
            sfdcAuthCredentials.conn, output.defaultConfiguration.Active_Configuration__c);

        // Create an Account using the configured recordType
        output.accountCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Account', {
                Name: accountName,
                RecordType: output.configurationProperties.Account_Record_Type_Developername__c
            });

        // Map the newly created accountId to the contact to create
        contactObject.AccountId = output.accountCreateResult.id;

        // Create the Child Contact
        output.contactCreateResult = await sObjectAPIs.create(
            sfdcAuthCredentials.conn, 'Contact', contactObject);

        // Are PersonAccounts enabled for the scratchOrg?
        if (accountType === 'personaccounts' && createDirectPersonAccount === false) {

            // Retrieve the recordType for PersonAccounts
            personAccountRecordTypeResults = await recordTypeAPIs.getByDeveloperName(
                sfdcAuthCredentials.conn, personAccountDeveloperName);

            // Create a reference to the expected record
            personAccountRecordType = personAccountRecordTypeResults[0];

            // Update the recordType on the Account to create a personAccount
            output.personAccountUpdateResult = await sObjectAPIs.update(
                sfdcAuthCredentials.conn, 'Account', {
                    Id: output.accountCreateResult.id,
                    RecordTypeId: personAccountRecordType.Id
                });

        }

        // Seed the account and contact identifiers
        output.accountId = output.accountCreateResult.id;
        output.contactId = output.contactCreateResult.id;

    }

    // Return the output variable
    return output;

};
