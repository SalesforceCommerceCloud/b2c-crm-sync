'use strict';

// Initialize local libraries
const sObjectAPIs = require('../../../../../apis/sfdc/sObject');

/**
 * @function _deleteAccountsById
 * @description Helper function to delete accounts
 *
 * @param {Connection} connection Represents the connection used to perform remote SFDC queries
 * @param {Array} accountResults Represents the search results containing accounts to delete
 * @return {Object} Returns the output results of the delete process
 */
module.exports = async (connection, accountResults) => {

    // Initialize the output variable
    let successFlag,
        accountObj,
        output;

    // Set defaults
    output = {};
    successFlag = true;

    // Attempt to delete each Account found
    for (let contactIndex = 0; contactIndex < accountResults.length; contactIndex++) {

        // Create a reference to the current account being processed
        accountObj = accountResults[contactIndex];

        // If so, then delete the specified Account
        output[accountObj.Id] = await sObjectAPIs.destroy(
            connection, 'Account', accountObj.Id);

        // Was an error caught?  If so, update the successFlag
        if (output[accountObj.Id].success === false) {
            successFlag = false;
        }

    }

    // Set the successFlag based on delete results
    output.success = successFlag;

    // Return the output property
    return output;

}
