'use strict';

// Initialize local libraries
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');
const metaDataAPIs = require('../../../lib/qa/processes/_common/sfdc/customMetaData');

/**
 * @function sfdcAccountContactPurge
 * @description Helper function for B2C Customer profile / SFDC Account and Contact deletion.  This
 * function is used to remove our test-data records to ensure that no record-conflicts exist.
 *
 * @param {Connection} sfdcAuthCredentials Represents the active connection for SFDC provided via jsForce
 * @param {Object} contactObject Represents the contactObject to create
 * @param {String} accountName Represents the Account Name to leverage
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcAuthCredentials, contactObject, accountName) => {

    // Initialize the output scope
    let output = {};

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

    // Return the output variable
    return output;

}
