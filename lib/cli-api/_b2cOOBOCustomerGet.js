'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const dataAPIs = require('../../lib/apis/sfcc/ocapi/data');
const b2cRequestLib = require('../../lib/_common/request');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const createOOBOCustomerDisplayOutput = require('./_common/_createOOBOCustomerDisplayOutput');

/**
 * @function _b2cGetOOBOCustomer
 * @description Attempts to retrieve the OOBO Customer record for a give site / customerList
 * combination.  It will verify the existence of the OOBO Customer record.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Object} siteDef Represents the site that will be used to drive the OOBO Customer retrieval
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, siteDef) => new Promise(async (resolve, reject) => {

    // Initialize constants
    const customerNo = config.get('b2c.ooboCustomer.customerNo');

    // Initialize local variables
    let b2cAdminAuthToken,
        baseRequest;

    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            sfdcAuthenticate: {},
            customerGet: {}
        },
        outputDisplay: {
            authenticate: {},
            customerGet: {}
        }
    };

    try {

        // Authenticate and audit the authorization token for future rest requests
        output.apiCalls.authenticate.authToken = await b2cAuthenticate(environmentDef);
        output.outputDisplay.authenticate.authToken = output.apiCalls.authenticate.authToken;

    } catch (e) {

        // Capture the error details -- and then exit early
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);
        return;

    }

    // Initialize the base request leveraged by this process
    baseRequest = b2cRequestLib.createRequestInstance(environmentDef);
    b2cAdminAuthToken = output.apiCalls.authenticate.authToken;

    // Attempt to verify that the current customer exists / does not exist
    output.apiCalls.customerGet = await dataAPIs.customerGet(
        baseRequest, b2cAdminAuthToken, siteDef.data.customerList, customerNo);

    // Was a fault encountered when we attempted to retrieve the customerProfile?
    if (output.apiCalls.customerGet.status !== 200) {

        // Attach the profile identifiers
        output.outputDisplay.customerGet = [
            ['customerList', siteDef.data.customerList],
            ['customerNo', customerNo],
            ['status', 'OOBO Customer profile was not found for this customerList / customerNo combination'],
            ['customerId', '---'],
            ['accountId', '---'],
            ['contactId', '---']
        ];

    } else {

        // Otherwise, default the profile details
        output.profile = output.apiCalls.customerGet.data;

        // Map the customerList to the current profile
        output.profile.customer_list = siteDef.data.customerList;

        // Build out the output display for the current profile
        output.outputDisplay.customerGet = createOOBOCustomerDisplayOutput(output.profile);

    }

    // Return the generated output
    resolve(output);

});
