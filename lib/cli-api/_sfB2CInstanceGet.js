'use strict';

// Initialize required modules
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

/**
 * @function _sfB2CInstanceGet
 * @description Attempts to retrieve a B2C Instance record
 *
 * @param {connection} authConnection Represents the connection that should be used to perform the getQuery
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the results of the B2C Instance search
 */
module.exports = (authConnection, environmentDef) => sObjectAPIs.search(
    authConnection,
    `
        SELECT  Id, 
                Name, 
                Is_Active__c
        FROM    B2C_Instance__c 
        WHERE   Name = '${environmentDef.b2cInstanceName}'
        ORDER
        BY      LastModifiedDate
        LIMIT   1
    `
);

