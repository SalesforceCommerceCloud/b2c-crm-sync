'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfOOBOB2CSitesUpdate
 * @description Attempts to update the OOBO Customer details for each of the B2C Sites associated using the customer details
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Object} customerProfile Represents the customerProfile that will be applied to related B2C Sites
 * @returns {Promise}
 */
module.exports = async (environmentDef, customerProfile) => {

    // Initialize local variables
    let output;

    // Initialize the output variable
    output = {};

    // Retrieve the B2C CustomerList
    output.b2cCustomerList = await sfdx.data.recordGet({
        sobjecttype: 'B2C_CustomerList__c',
        where: `Name='${customerProfile.customer_list}'`
    });

    // Exit early if the customerList isn't verified
    if (!output.b2cCustomerList) { return; }

    // Retrieve the sites associated to the current customerList
    output.b2cSites = await sfdx.data.soqlQuery({
        query: `SELECT Id, Name FROM B2C_Site__c WHERE Customer_List__c='${output.b2cCustomerList.Id}'`
    });

    // Was at least one site found?
    if (output.b2cSites.totalSize > 0) {

        // Create the updates elements
        output.b2cSiteUpdates = {};

        // If so, then let's default each of the b2cSites
        for (let thisSite of output.b2cSites.records) {

            // Update the current B2C Site and reset the customerId / customerNo
            output.b2cSiteUpdates[thisSite.Name] = await sfdx.data.recordUpdate({
                sobjecttype: 'B2C_Site__c',
                sobjectid: thisSite.Id,
                values: `OOBO_Customer_Number__c='${customerProfile.customer_no}', OOBO_Customer_ID__c='${customerProfile.customer_id}'`
            });

        }

    }

    // Return the object representations
    return output;

};
