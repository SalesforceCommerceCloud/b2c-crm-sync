'use strict';

// Initialize local libraries
const common = require('./_common');

/**
 * @function _update
 * @description Update the contents of an existing sObject
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} sObjectName represents the name of the sObject being updated
 * @param {Object} objectDetails Represents the object definition used to update the sObject
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, sObjectName, objectDetails) => new Promise((resolve, reject) => {

    try {

        // Update the sObject in question (include the Id in the objectDetails)
        sfConn.sobject(sObjectName).update(objectDetails, function (err, updateResults) {

            // Process the response with the generated inputs
            common.handleResponse(resolve, reject, err, updateResults);

        });

    } catch (e) {

        // Handle the error details
        common.handleError(reject, e);

    }

});
