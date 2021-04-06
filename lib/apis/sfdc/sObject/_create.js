'use strict';

// Initialize local libraries
const common = require('./_common');

/**
 * @function _create
 * @description Attempts to create a contact record in SFDC
 *
 * @param {Object} sfConn Represents the base request-instance to leverage
 * @param {String} sObjectName represents the name of the sObject being created
 * @param {Object} objectDetails Represents the object definition used to create the sObject
 * @returns {Promise} Returns a promise that announces the execution results
 */
module.exports = (sfConn, sObjectName, objectDetails) => new Promise( (resolve, reject) => {

    try {

        // Create the sObject record in question
        sfConn.sobject(sObjectName).create(objectDetails, function(err, sObject) {

            // Process the response with the generated inputs
            common.handleResponse(resolve, reject, err, sObject);

        });

    } catch (e) {

        // Handle the error details
        common.handleError(reject, e);

    }

});
