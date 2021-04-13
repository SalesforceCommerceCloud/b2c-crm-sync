'use strict';

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _getRecordType
 * @description Retrieves the recordType properties for the developerName specified
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} developerName Represents developerName of the recordType to retrieve
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, developerName) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {
        DeveloperName: developerName
    };

    // Define the fields to retrieve
    fieldMap = {
        Id: 1,
        DeveloperName: 1
    };

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'RecordType', filterQuery, fieldMap, 1);

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
