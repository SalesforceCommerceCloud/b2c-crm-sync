'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _searchByCustomerListIdEmail
 * @description Searches for a Contact record via their identifiers
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} customerListId Represents the customerList to filter against
 * @param {String} emailAddress Represents the email address to query against
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, customerListId, emailAddress) => new Promise( async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {
        B2C_CustomerList_ID__c : customerListId,
        Email : emailAddress
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
