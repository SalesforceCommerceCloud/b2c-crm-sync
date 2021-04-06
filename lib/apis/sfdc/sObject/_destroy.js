'use strict';

// Initialize local libraries
const common = require('./_common');

/**
 * @function _destroy
 * @description Removes an sObject from the Salesforce instance
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} sObjectName represents the name of the sObject being created
 * @param {String} Id Describes the identifier of the record being removed
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, sObjectName, Id) => new Promise( (resolve, reject) => {

    try {

        // Remove the sObject from the Salesforce instance
        sfConn.sobject(sObjectName).destroy(Id, function(err, destroyResults) {

            // Process the response with the generated inputs
            common.handleResponse(resolve, reject, err, destroyResults);

        });

    } catch (e) {

        // Handle the error details
        common.handleError(reject, e);

    }

});
