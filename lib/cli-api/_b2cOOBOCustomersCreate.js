'use strict';

// Include B2C Commerce API functions
const b2cOOBOCustomerCreate = require('./_b2cOOBOCustomerCreate');

/**
 * @function _b2cCreateOOBODeploy
 * @description Attempts to create customers for each customerlist configured across multiple sites.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Array} verifiedSites Represents the collection of verified sites to process
 * @returns {Promise} Returns the results of the OOBO customerDeployment
 */
module.exports = (environmentDef, verifiedSites) => new Promise(async (resolve) => {

    // Initialize local variables
    let output,
        customerLists,
        customerProfileResult;

    // Initialize the customerList tracker
    customerLists = {};
    output = [];

    // Loop over the collection of verified sites and process the OOBO Customer
    for (let thisSite of verifiedSites) {

        // Skip this site if the CustomerList has already been processed
        // eslint-disable-next-line no-continue
        if (Object.prototype.hasOwnProperty.call(customerLists, thisSite.data.customerList)) { continue; }

        // Capture the result of the profile creation / verification process
        customerProfileResult = await b2cOOBOCustomerCreate(environmentDef, thisSite);

        // Retrieve and output the results of the verification process
        output.push(customerProfileResult);

        // Flag that the customerList has been processed
        customerLists[thisSite.data.customerList] = customerProfileResult;

    }

    // Return the processed results
    resolve(output);

});
