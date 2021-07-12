'use strict';

// Initialize required modules
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');
const config = require('config');

/**
 * @function _sfB2CInstanceUpdate
 * @description Attempts to update the previously created b2c instance with the parent B2C Client ID
 *
 * @param {connection} authConnection Represents the connection that should be used to perform the getQuery
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} b2cClientRecordId Represents the Salesforce recordId for the B2C Client associated to the Instance
 * @param {String} recordId represents the Salesforce B2C Client ID recordID value to update
 * @returns {Promise} Returns the B2C Instance record update results
 */
module.exports = async (authConnection, environmentDef, b2cClientRecordId, recordId) => {

    // Initialize local variables
    let sampleDescription,
        instanceType;

    // Default the labels used to create the sample record
    sampleDescription = config.get('sfScratchOrg.b2cInstance.description');
    instanceType = config.get('sfScratchOrg.b2cInstance.instanceType');

    // Attempt to create the B2C ClientID record
    return sObjectAPIs.update(
        authConnection,
        'B2C_Instance__c',
        {
            Id: recordId,
            B2C_Client_ID__c: b2cClientRecordId,
            Name: environmentDef.b2cInstanceName,
            Is_Active__c: true,
            Instance_Type__c: instanceType,
            Instance_Description__c: sampleDescription,
            API_Url__c: `https://${environmentDef.b2cHostName}`
        }
    );


};
