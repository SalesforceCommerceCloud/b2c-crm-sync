'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _searchByCustomerListIdCustomerNo
 * @description Searches for a Contact record via the B2C Identifiers
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} customerListId Represents the customerList to filter against
 * @param {String} customerNo Represents the customerNo to query against
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, customerListId, customerNo) => new Promise( async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {
        B2C_CustomerList_ID__c : customerListId,
        B2C_Customer_No__c : customerNo
    };

    // Define the fields to retrieve
    fieldMap = config.get('unitTests.testData.contactFieldMap');

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'Contact', filterQuery, fieldMap);

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
