'use strict';

// Initialize local libraries
const common = require('./_common');

/**
 * @function _retrieve
 * @description Retrieves the details of an sObject using its identifier
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} sObjectName represents the name of the sObject being searched
 * @param {Object} queryObject represents the sObject properties to search
 * @param {Object} fieldMap represents the fields to retrieve in the search
 * @param {Integer} [recordLimit] represents the number of rows to retrieve
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, sObjectName, queryObject, fieldMap, recordLimit = 1) => new Promise((resolve, reject) => {

    try {

        // Execute the query
        sfConn
            .sobject(sObjectName)
            .find(queryObject, fieldMap)
            .limit(recordLimit)
            .execute(function (err, queryResults) {

                // Process the response with the generated inputs
                common.handleResponse(resolve, reject, err, queryResults);

            });

    } catch (e) {

        // Handle the error details
        common.handleError(reject, e);

    }

});
