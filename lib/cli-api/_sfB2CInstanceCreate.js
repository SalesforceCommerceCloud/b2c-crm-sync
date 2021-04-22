'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');
const config = require('config');

/**
 * @function _sfB2CInstanceCreate
 * @description Attempts to deploy b2c-crm-sync code a SFDX scratch org
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise}
 */
module.exports = (environmentDef) => {

    // Initialize local variables
    let sampleDescription,
        instanceType;

    // Default the labels used to create the sample record
    sampleDescription = config.get('sfScratchOrg.b2cInstance.description');
    instanceType = config.get('sfScratchOrg.b2cInstance.instanceType');

    // Attempt to create the B2C Instance record
    return sfdx.data.recordCreate({
        sobjecttype: 'B2C_Instance__c',
        values: `Name='${environmentDef.b2cInstanceName}' Instance_Type__c='${instanceType}' Is_Active__c=true API_Url__c=https://${environmentDef.b2cHostName} Instance_Description__c='${sampleDescription}'`
    });

};
