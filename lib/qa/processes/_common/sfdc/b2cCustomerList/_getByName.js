'use strict';

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _getByName
 * @description Retrieves the specified customerList record by objectName
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
    fieldMap = {
        Id: 1,
        Name: 1
    };

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'B2C_CustomerList__c', filterQuery, fieldMap, 1);

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
