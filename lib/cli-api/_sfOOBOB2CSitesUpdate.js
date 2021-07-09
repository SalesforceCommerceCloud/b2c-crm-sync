'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfOOBOB2CSitesUpdate
 * @description Attempts to update the OOBO Customer details for each of the B2C Sites associated using the customer details
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Object} customerProfile Represents the customerProfile that will be applied to related B2C Sites
 * @returns {Promise} Returns the results of the siteUpdate request re: the OOBO site-specific properties
 */
module.exports = (environmentDef, customerProfile) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        let output;

        // Initialize the output variable
        output = {};

        try {

            // Retrieve the B2C CustomerList
            output.b2cCustomerList = await sfdx.data.recordGet({
                sobjecttype: 'B2C_CustomerList__c',
                where: `Name='${customerProfile.customerListId}'`
            });

            // Exit early if the customerList isn't verified
            if (!output.b2cCustomerList) {

                // Capture the error resolving the customerList
                output.error = `Unable to resolve B2C CustomerList: ${customerProfile.customerListId}`;
                output.success = false;

                // Reject and pause processing
                reject(output);

            } else {

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
                            values: `OOBO_Customer_ID__c='${customerProfile.customerId}'`
                        });

                        // Update the current B2C Site and reset the customerNo
                        output.b2cSiteUpdates[thisSite.Name].customerNo = await sfdx.data.recordUpdate({
                            sobjecttype: 'B2C_Site__c',
                            sobjectid: thisSite.Id,
                            values: `OOBO_Customer_Number__c='${customerProfile.customerNo}'`
                        });

                    }

                }

                // Flag the result as valid
                output.success = true;

                // Return the object representations
                resolve(output);

            }

        } catch (e) {

            // Flag the result as invalid
            output.success = false;
            output.error = e;

            // Reject the result
            reject(output);

        }

    }

);
