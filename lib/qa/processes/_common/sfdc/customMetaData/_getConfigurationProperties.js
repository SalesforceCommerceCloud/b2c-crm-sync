'use strict';

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _getConfigurationProperties
 * @description Retrieves the default configuration for the B2C CRM Sync application
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} Id Represents name of the configuration to retrieve
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, Id) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {
        Id: Id
    };

    // Define the fields to retrieve
    fieldMap = {
        Id: 1,
        DeveloperName: 1,
        MasterLabel: 1,
        Account_Contact_Model__c: 1,
        Default_Account_Name__c: 1,
        Default_Contact_Name__c: 1,
        Account_Record_Type_Developername__c: 1,
        Enable_B2C_Process_Contact_Trigger__c: 1
    };

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'B2C_CRMSync_Setting__mdt', filterQuery, fieldMap, 1);

        // Tag the success flag
        output.success = true;

        // Resolve the result
        resolve(output);

    } catch (e) {

        // Tag the success flag
        e.success = false;

        // Otherwise, reject the error
        reject(e);

    }

});
