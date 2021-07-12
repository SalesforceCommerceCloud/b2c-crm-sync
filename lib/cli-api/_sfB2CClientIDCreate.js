/* eslint-disable max-len */
'use strict';

// Initialize required modules
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

/**
 * @function _sfB2CClientIDCreate
 * @description Attempts to create the seed B2CClientID record used by the Salesforce Platform
 *
 * @param {connection} authConnection Represents the connection that should be used to perform the getQuery
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the B2CClientID record creation results
 */
module.exports = (authConnection, environmentDef) => {

    // Attempt to create the B2C ClientID record
    return sObjectAPIs.create(
        authConnection,
        'B2C_Client_ID__c',
        {
            Name: environmentDef.b2cClientId,
            JWT_Certificate_Name__c: environmentDef.sfCertDeveloperName,
            Is_Active__c: true,
            Audit_Authentication_API_Interactions__c: true,
            B2C_Client_ID_Label__c: 'Default B2C ClientID'
        }
    );

};
