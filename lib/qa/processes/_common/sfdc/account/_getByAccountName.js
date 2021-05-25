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
 * @param {String} name Represents the internal name of the customerList to retrieve
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, name) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {
        Name: name
    };

    // Define the fields to retrieve
    fieldMap = config.get('unitTests.testData.accountFieldMap');

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'Account', filterQuery, fieldMap);

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
