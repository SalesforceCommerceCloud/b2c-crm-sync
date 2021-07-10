'use strict';

// Initialize required modules
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

/**
 * @function _sfDuplicateRulesGet
 * @description Attempts to retrieve the collection of duplicateRules for a Salesforce Org
 *
 * @param {connection} authConnection Represents the connection that should be used to perform the getQuery
 * @param {String} profileObject Describes the profile objectType (Contact or Account) to search for
 * @param {String} ruleName Describes the duplicateRule to retrieve
 * @returns {Promise} Returns the collection of duplicateRules found
 */
module.exports = (authConnection, profileObject, ruleName) => sObjectAPIs.search(
    authConnection,
    `
        SELECT  Id,
                DeveloperName,
                SobjectType,
                MasterLabel,
                IsActive,
                IsDeleted,
                CreatedDate
        FROM    DuplicateRule
        WHERE   SobjectType = '${profileObject}'
                AND DeveloperName = '${ruleName}'
        LIMIT   1
    `
);

