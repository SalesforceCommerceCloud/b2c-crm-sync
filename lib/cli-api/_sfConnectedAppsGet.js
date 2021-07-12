'use strict';

// Initialize required modules
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

/**
 * @function _sfConnectedAppsGet
 * @description Attempts to retrieve the collection of connectedApps for a Salesforce Org
 *
 * @param {connection} authConnection Represents the connection that should be used to perform the getQuery
 * @returns {Promise} Returns the collection of connectedApps found
 */
module.exports = (authConnection) => sObjectAPIs.search(
    authConnection,
    `
        SELECT  Id,
                Name,
                CreatedDate
        FROM    ConnectedApplication
        WHERE   Name LIKE '%B2C_CRM_SYNC%'
    `
);

