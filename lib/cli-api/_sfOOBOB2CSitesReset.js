'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfOOBOB2CSitesReset
 * @description Attempts to reset the OOBO Customer details for each of the B2C Sites associated to the specified customerList
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} customerList Represents the customerList for which Sites will be updated
 * @returns {Promise} Returns the result of the reset-request for site-specific OOBO properties
 */
module.exports = (environmentDef, customerList) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        let output;

        // Initialize the output variable
        output = {};

        try {

            // Retrieve the B2C CustomerList
            output.b2cCustomerList = await sfdx.data.recordGet({
                sobjecttype: 'B2C_CustomerList__c',
                where: `Name='${customerList}'`
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

                    // Initialize the siteUpdate output
                    output.b2cSiteUpdates[thisSite.Name] = {};

                    // Update the current B2C Site and reset the customerId
                    output.b2cSiteUpdates[thisSite.Name].customerId = await sfdx.data.recordUpdate({
                        sobjecttype: 'B2C_Site__c',
                        sobjectid: thisSite.Id,
                        values: 'OOBO_Customer_ID__c=null'
                    });

                    // Update the current B2C Site and reset the customerNo
                    output.b2cSiteUpdates[thisSite.Name].customerNo = await sfdx.data.recordUpdate({
                        sobjecttype: 'B2C_Site__c',
                        sobjectid: thisSite.Id,
                        values: 'OOBO_Customer_Number__c=null'
                    });

                }

            }

            // Flag the request as successful
            output.success = true;

            // Resolve successfully
            resolve(output);

        } catch (e) {

            // Flag the request as failed
            output.success = false;
            output.error = e;

            // Reject with an error
            reject(output);

        }

    }

);
