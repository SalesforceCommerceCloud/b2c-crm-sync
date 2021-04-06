'use strict';

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _getDefaultConfiguration
 * @description Retrieves the default configuration for the B2C CRM Sync application
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn) => new Promise( async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {};

    // Define the fields to retrieve
    fieldMap = {
        Active_Configuration__c: 1
    }

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'B2C_CRM_Sync_Default_Configuration__mdt', filterQuery, fieldMap, 1);

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
