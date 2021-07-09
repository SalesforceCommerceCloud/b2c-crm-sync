'use strict';

// Initialize required modules
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

/**
 * @function _sfB2CClientIDGet
 * @description Attempts to retrieve a B2C ClientID record
 *
 * @param {connection} authConnection Represents the connection that should be used to perform the getQuery
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the results of the B2C ClientID definition attempt
 */
module.exports = (authConnection, environmentDef) => sObjectAPIs.search(
    authConnection,
    `
        SELECT  Id, 
                Name, 
                Is_Active__c, 
                JWT_Certificate_Name__c 
        FROM    B2C_Client_ID__c 
        WHERE   Name = '${environmentDef.b2cClientId}'`
);

