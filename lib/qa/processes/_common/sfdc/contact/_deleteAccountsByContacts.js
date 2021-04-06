'use strict';

// Initialize local libraries
const sObjectAPIs = require('../../../../../apis/sfdc/sObject');

/**
 * @function _deleteAccountsContacts
 * @description Helper function to delete associated accounts / contacts
 *
 * @param {Connection} connection Represents the connection used to perform remote SFDC queries
 * @param {Array} contactResults Represents the search results containing account / contact pairs to delete
 * @return {Object} Returns the output results of the delete process
 */
module.exports = async (connection, contactResults) => {

    // Initialize the output variable
    let successFlag,
        contactObj,
        output;

    // Set defaults
    output = {};
    successFlag = true;

    // Attempt to delete each Account / Contact Pair found
    for (let contactIndex = 0; contactIndex < contactResults.length; contactIndex++) {

        // Create a reference to the current contact being processed
        contactObj = contactResults[contactIndex];

        // If so, then delete the parent Account
        output[contactObj.AccountId] = await sObjectAPIs.destroy(
            connection, 'Account', contactObj.AccountId);

        // Was an error caught?  If so, update the successFlag
        if (output[contactObj.AccountId].success === false) {
            successFlag = false;
        }

    }

    // Set the successFlag based on delete results
    output.success = successFlag;

    // Return the output property
    return output;

}
