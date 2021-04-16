'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');
const recordTypeAPIs = require('../../../lib/qa/processes/_common/sfdc/recordType');
const b2cCustomerListAPIs = require('../../../lib/qa/processes/_common/sfdc/b2cCustomerList');

/**
 * @function sfdcPersonAccountCreate
 * @description Helper function for B2C Customer profile / SFDC PersonAccount creation.  This function
 * is used to create test-data records that are used to test different resolution / duplicate processing scenarios.
 *
 * @param {Connection} sfdcAuthCredentials Represents the active connection for SFDC provided via jsForce
 * @param {Object} contactObject Represents the contactObject to create
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcAuthCredentials, contactObject) => {

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

    // Retrieve the recordType for PersonAccounts
    personAccountRecordTypeResults = await recordTypeAPIs.getByDeveloperName(
        sfdcAuthCredentials.conn, personAccountDeveloperName);

    // Create a reference to the expected record
    personAccountRecordType = personAccountRecordTypeResults[0];

    // Initialize the personAccount object
    personAccountObj = {
        LastName: contactObject.LastName,
        PersonEmail: contactObject.Email,
        RecordTypeId: personAccountRecordType.Id
    };

    // Was a customerListID found?  If so, then retrieve the parentId
    if (contactObject.hasOwnProperty('B2C_CustomerList_ID__c')) {

        // Retrieve the native B2C CustomerList
        b2cCustomerList = await b2cCustomerListAPIs.getByName(
            sfdcAuthCredentials.conn, contactObject.B2C_CustomerList_ID__c);

        // Create a reference to the retrieved customerList
        b2cCustomerList = b2cCustomerList[0];

        // Assign the customerList identifier to the contact object
        personAccountObj.B2C_CustomerList__pc = b2cCustomerList.Id;
        personAccountObj.B2C_CustomerList_ID__pc = contactObject.B2C_CustomerList_ID__c;

    }

    console.log(personAccountObj);

    // Create an Account using the configured recordType
    output.accountCreateResult = await sObjectAPIs.create(
        sfdcAuthCredentials.conn, 'Account', personAccountObj);

    console.log(output);

    // Return the output variable
    return output;

};
