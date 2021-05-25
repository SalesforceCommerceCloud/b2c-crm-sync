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
    let successFlag = true,
        contactObj,
        output = {},
        keyId,
        sObject;

    // Attempt to delete each Account / Contact Pair found
    for (let contactIndex = 0; contactIndex < contactResults.length; contactIndex++) {

        // Create a reference to the current contact being processed
        contactObj = contactResults[contactIndex];

        keyId = contactObj.AccountId || contactObj.Id;
        sObject = contactObj.AccountId ? 'Account' : 'Contact';

        // If so, then delete the parent Account
        output[keyId] = await sObjectAPIs.destroy(connection, sObject, keyId);

        // Was an error caught?  If so, update the successFlag
        if (output[keyId].success === false) {
            successFlag = false;
        }

    }

    // Set the successFlag based on delete results
    output.success = successFlag;

    // Return the output property
    return output;

};
