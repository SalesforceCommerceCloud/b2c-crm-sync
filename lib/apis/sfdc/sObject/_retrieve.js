'use strict';

// Initialize local libraries
const common = require('./_common');

/**
 * @function _retrieve
 * @description Retrieves the details of an sObject using its identifier
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} sObjectName represents the name of the sObject being created
 * @param {String} Id Describes the sObject record being retrieved
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, sObjectName, Id) => new Promise((resolve, reject) => {

    try {

        // Retrieve a single sObject record using the identifier
        sfConn.sobject(sObjectName).retrieve(Id, function (err, sObject) {

            // Process the response with the generated inputs
            common.handleResponse(resolve, reject, err, sObject);

        });

    } catch (e) {

        // Handle the error details
        common.handleError(reject, e);

    }

});
