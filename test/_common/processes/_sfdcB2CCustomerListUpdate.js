'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');
const b2cCustomerListAPIs = require('../../../lib/qa/processes/_common/sfdc/b2cCustomerList');

/**
 * @function sfdcB2CCustomerListUpdate
 * @description Helper function to modify a B2C CustomerList (either activate or de-activate).
 *
 * @param {Connection} sfdcAuthCredentials Represents the active connection for SFDC provided via jsForce
 * @param {String} customerListId Represents the customerList to de-activate
 * @param {Boolean} activeStatus Represents the active-status to apply to a B2C CustomerList
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcAuthCredentials, customerListId, activeStatus) => {

    // Initialize local variables
    let output = {};

    // First, retrieve the customerList definition using the id / name provided
    output.customerListGet = await b2cCustomerListAPIs.getByName(sfdcAuthCredentials, customerListId);

    // Set the activeStatus for the specified B2C CustomerList
    output.customerListUpdateResult = await sObjectAPIs.update(sfdcAuthCredentials, 'B2C_CustomerList__c', {
        Id: output.customerListGet[0].Id,
        Is_Active__c: activeStatus
    });

    // Next, retrieve the customerList definition using the id / name provided and verify the update
    output.customerListGetAfterUpdate = await b2cCustomerListAPIs.getByName(sfdcAuthCredentials, customerListId);

    // Return the output result
    return output;

};
