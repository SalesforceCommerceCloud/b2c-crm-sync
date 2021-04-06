'use strict';

// Initialize local libraries
const common = require('./_common');

/**
 * @function _retrieve
 * @description Retrieves the details of an sObject using its identifier
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} soqlQuery represents the SOQL Query to leverage in search
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, soqlQuery) => new Promise( (resolve, reject) => {

    try {

        // Execute the query
        sfConn.query(soqlQuery, function(err, queryResults) {

            // Process the response with the generated inputs
            common.handleResponse(resolve, reject, err, queryResults);

        });

    } catch (e) {

        // Handle the error details
        common.handleError(reject, e);

    }

});
