'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const sObjectAPIs = require('../../../lib/apis/sfdc/sObject');

/**
 * @function sfdxB2CInstanceUpdate
 * @description Helper function to modify a B2C Instance (either activate or de-activate).
 *
 * @param {Connection} sfdcAuthCredentials Represents the active connection for SFDC provided via jsForce
 * @param {String} instanceId Represents the B2C Instance to de-activate
 * @param {Boolean} activeStatus Represents the active-status to apply to a B2C Instance
 * @return {Promise} Returns the output result from the purge-processing
 */
module.exports = async (sfdcAuthCredentials, instanceId, activeStatus) => {

    // Initialize local variables
    let output = {};

    // Set the activeStatus for the specified B2C CustomerList
    output.b2cInstanceUpdateResult = await sObjectAPIs.update(sfdcAuthCredentials, 'B2C_Instance__c', {
        Id: instanceId,
        Is_Active__c: activeStatus
    });

    // Return the output result
    return output;

};
