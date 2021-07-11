'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const b2cRequestLib = require('../../lib/_common/request');
const dataAPIs = require('../../lib/apis/sfcc/ocapi/data');
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const sfAuthUserCredentials = require('./_sfAuthUserCredentials');

/**
 * @function _b2cOOBOCustomerDelete
 * @description Attempts to delete the OOBO Customer record for a give site / customerList
 * combination.  It will either verify the existence of the OOBO Customer record -- or create one.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Object} customerProfile Represents the customerProfile that will be deleted from the B2C Commerce instance
 * @returns {Promise} Returns the result of the customerDelete request
 */
module.exports = (environmentDef, customerProfile) =>
    new Promise(async (resolve, reject) => {

        // Initialize local variables
        let b2cAdminAuthToken,
            sfdcAuthResults,
            baseRequest;

        // Roll-up the validation results to a single object
        const output = {
            apiCalls: {
                authenticate: {},
                sfdcAuthenticate: {},
                b2cCustomerDelete: {},
                sfdcCustomerDelete: {}
            },
            outputDisplay: {
                authenticate: {},
                sfdcAuthenticate: {},
                b2cCustomerDelete: {},
                sfdcCustomerDelete: {}
            }
        };

        try {

            // Authenticate and audit the authorization token for future rest requests
            output.apiCalls.authenticate.authToken = await b2cAuthenticate(environmentDef);
            output.outputDisplay.authenticate.authToken = output.apiCalls.authenticate.authToken;

        } catch (e) {

            // Capture the error details -- and then exit early
            reject(`${config.get('errors.b2c.unableToAuthenticate')}`);
            return;

        }

        try {

            // Attempt to authenticate against the SFDC environment
            sfdcAuthResults = await sfAuthUserCredentials(environmentDef);

            // Audit the authResults service-call
            output.apiCalls.sfdcAuthenticate = sfdcAuthResults.apiCalls.sfAuthenticate.authResults;

        } catch (e) {

            // Capture the error details -- and then exit early
            reject(`${config.get('errors.sf.unableToAuthenticate')}`);
            return;

        }

        // Initialize the base request leveraged by this process
        baseRequest = b2cRequestLib.createRequestInstance(environmentDef);
        b2cAdminAuthToken = output.apiCalls.authenticate.authToken;

        // Attempt to verify that the current customer exists / does not exist
        output.apiCalls.b2cCustomerDelete = await dataAPIs.customerDelete(
            baseRequest,
            b2cAdminAuthToken,
            customerProfile.customer_list,
            customerProfile.customer_no);

        // Was a fault encountered when we attempted to delete the customerProfile?
        if (output.apiCalls.b2cCustomerDelete.status === 204 &&
            Object.prototype.hasOwnProperty.call(customerProfile, 'c_b2ccrm_contactId') &&
            (customerProfile.c_b2ccrm_accountId !== '---' || customerProfile.c_b2ccrm_accountId.length === 0)) {

            try {

                // Audit that we're deleting the contact from the Salesforce org
                console.log(' -- Removing the OOBO Customer Profile from the Salesforce Org');

                // Delete the parent Account and child Contact record
                output.apiCalls.sfdcCustomerNoUpdate = await sObjectAPIs.destroy(
                    output.apiCalls.sfdcAuthenticate.conn,
                    'Account',
                    customerProfile.c_b2ccrm_accountId);

            } catch (e) {}

        }

        // Exit and render the processing results
        resolve(output);

    });
