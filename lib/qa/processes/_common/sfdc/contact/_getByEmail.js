'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const sfdxAPIs = require('../../../../../../lib/apis/sfdc/sObject');

/**
 * @function _getByEmail
 * @description Searches for a Contact record via customer's email address
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} emailAddress Represents the email address to query against
 * @param {Number} recordLimit Represents the total number of records to return
 * @param {Number} filterPersonAccounts if true, we need to exclude person accounts from the query
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, emailAddress, recordLimit = 1, filterPersonAccounts = false) => new Promise(async (resolve, reject) => {

    // Initialize local variables
    let output,
        filterQuery,
        fieldMap;

    // Define the fields to filter on
    filterQuery = {
        Email: { $like: '%' + emailAddress + '%' }
    };

    // if person accounts are enabled and filterPersonAccounts is set to true
    // we need to exclude person accounts from the Contacts filter
    // person accounts have to be deleted from the Account SObject, not the Contact
    if (filterPersonAccounts) {
        filterQuery['Account.isPersonAccount'] = false;
    }

    // Define the fields to retrieve
    fieldMap = config.get('unitTests.testData.contactFieldMap');

    try {

        // Execute the find-query against the Contact record
        output = await sfdxAPIs.find(sfConn, 'Contact', filterQuery, fieldMap, recordLimit);

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
