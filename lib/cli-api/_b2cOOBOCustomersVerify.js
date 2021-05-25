'use strict';

// Include B2C Commerce API functions
const b2cOOBOCustomerGet = require('./_b2cOOBOCustomerGet');

/**
 * @function _b2cOOBOCustomersDisplay
 * @description Attempts to retrieve the customers for each customerlist configured across multiple sites.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Array} verifiedSites Represents the collection of verified sites to process (from which customerLists will be retrieved)
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, verifiedSites) => new Promise(async (resolve) => {

    // Initialize local variables
    let output,
        customerLists,
        customerProfileResult;

    // Initialize the output property
    output = [];

    // Initialize the customerList tracker
    customerLists = {};

    // Loop over the collection of verified sites and process the OOBO Customer
    for (let thisSite of verifiedSites) {

        // Skip this site if the CustomerList has already been processed
        // eslint-disable-next-line no-continue
        if (customerLists.hasOwnProperty(thisSite.data.customerList)) { continue; }

        // Capture the result of the profile creation / verification process
        customerProfileResult = await b2cOOBOCustomerGet(environmentDef, thisSite);

        // Increment the valid profileCount
        if (customerProfileResult.apiCalls.customerGet.status === 200) {

            // Retrieve and output the results of the verification process
            output.push(customerProfileResult);

        }

        // Flag that the customerList has been processed
        customerLists[thisSite.data.customerList] = customerProfileResult;

    }

    // Return the processed results
    resolve(output);

});
