'use strict';

// Initialize constants
const config = require('config');
const randomEmail = require('random-email');
const randomPassword = require('generate-password');

// Include local libraries
const dataAPIs = require('../../lib/apis/sfcc/ocapi/data');
const shopAPIs = require('../../lib/apis/sfcc/ocapi/shop');
const b2cRequestLib = require('../../lib/_common/request');
const sObjectAPIs = require('../../lib/apis/sfdc/sObject');
const sfAuthUserCredentials = require('./_sfAuthUserCredentials');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const createOOBOCustomerDisplayOutput = require('./_common/_createOOBOCustomerDisplayOutput');

/**
 * @function _b2cCreateOOBOCustomer
 * @description Attempts to create or retrieve the OOBO Customer record for a give site / customerList
 * combination.  It will either verify the existence of the OOBO Customer record -- or create one.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {Object} siteDef Represents the site that will be used to drive the OOBO Customer creation
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, siteDef) => new Promise(async (resolve, reject) => {

    // Initialize constants
    const customerNo = config.get('b2c.ooboCustomer.customerNo');
    const customerEmail = randomEmail({ domain: config.get('b2c.ooboCustomer.emailDomain') });

    // Initialize local variables
    let customerProfile,
        b2cAdminAuthToken,
        sfdcAuthResults,
        baseRequest,
        b2cGuestAuth;

    // Retrieve the template customer profile
    customerProfile = config.util.toObject(config.get('b2c.ooboCustomer.profile'));

    // Overwrite the email / login for the current customer
    customerProfile.customer.email = 'oobo-' + customerEmail;
    customerProfile.customer.login = customerProfile.customer.email;
    customerProfile.password = randomPassword.generate({ length: 10, numbers: true, symbols: true, strict: true });

    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            sfdcAuthenticate: {},
            customerGet: {},
            customerCreate: {}
        },
        outputDisplay: {
            authenticate: {},
            customerGet: {},
            customerCreate: {}
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

    try {

        // Attempt to authenticate against the SFDC environment
        sfdcAuthResults = await sfAuthUserCredentials(environmentDef);

        // Audit the authResults service-call
        output.apiCalls.sfdcAuthenticate = sfdcAuthResults.apiCalls.sfAuthenticate.authResults;

    } catch (e) {

        // Capture the error details -- and then exit early
        reject(`${config.get('errors.sf.unableToAuthenticate')}: ${e}`);
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

        // Create the output results for the retrieval process
        output.outputDisplay.customerGet = [
            output.apiCalls.customerGet.data.fault.type,
            output.apiCalls.customerGet.data.fault.message
        ];

        // Retrieve the guestAuthorization token from B2C Commerce
        b2cGuestAuth = await shopAPIs.authAsGuest(environmentDef, siteDef.siteId, environmentDef.b2cClientId);

        // Register the B2C Commerce customer profile
        output.apiCalls.customerCreate = await shopAPIs.customerPost(
            environmentDef, siteDef.siteId, environmentDef.b2cClientId, b2cGuestAuth.authToken, customerProfile);

        // Was the registration successful?
        if (output.apiCalls.customerCreate.success === true) {

            // If so, then let's update the customerNo for this customer
            output.apiCalls.customerGet = await dataAPIs.customerPatch(
                baseRequest, b2cAdminAuthToken, siteDef.data.customerList, output.apiCalls.customerCreate.data.customer_no, {
                    customer_no: customerNo
                });

            // Map the customerList to the current profile
            output.apiCalls.customerGet.data.password = customerProfile.password;

            // Before updating the customerNumber for the SFDC Contact -- validate that the contactId exists on the B2C Customer Profile
            if (output.apiCalls.customerGet.data.hasOwnProperty('c_b2ccrm_contactId') && output.apiCalls.customerGet.data.c_b2ccrm_contactId !== undefined) {

                // Update the customerNo for the specified contactId
                output.apiCalls.sfdcCustomerNoUpdate = await sObjectAPIs.update(
                    output.apiCalls.sfdcAuthenticate.conn,
                    'Contact',
                    {
                        Id: output.apiCalls.customerGet.data.c_b2ccrm_contactId,
                        B2C_Customer_No__c: customerNo
                    });

            }

        }

        // Attach the profile identifiers
        output.profile = {
            customerListId: output.apiCalls.customerGet.data.customer_list,
            siteId: siteDef.siteId,
            customerNo: customerNo,
            customerId: output.apiCalls.customerGet.data.customer_id,
            accountId: output.apiCalls.customerGet.data.c_b2ccrm_accountId,
            contactId: output.apiCalls.customerGet.data.c_b2ccrm_contactId
        };

    // Before updating the customerNumber for the SFDC Contact -- validate that the contactId exists on the B2C Customer Profile
    } else if (output.apiCalls.customerGet.data.hasOwnProperty('c_b2ccrm_contactId') && output.apiCalls.customerGet.data.c_b2ccrm_contactId !== undefined) {

        // Retrieve the SFDC customerDetails for this contact
        output.apiCalls.sfdcCustomerGet = await sObjectAPIs.retrieve(
            output.apiCalls.sfdcAuthenticate.conn,
            'Contact',
            output.apiCalls.customerGet.data.c_b2ccrm_contactId);

        // Was the corresponding contact record found in the SFDC org? And do the customerNo's match across records?
        if (output.apiCalls.sfdcCustomerGet.success === true && output.apiCalls.sfdcCustomerGet.B2C_Customer_No__c !== customerNo) {

            // Update the customerNo for the specified contactId -- if it's not in-sync
            output.apiCalls.sfdcCustomerNoUpdate = await sObjectAPIs.update(
                output.apiCalls.sfdcAuthenticate.conn,
                'Contact',
                {
                    Id: output.apiCalls.customerGet.data.c_b2ccrm_contactId,
                    B2C_Customer_No__c: customerNo
                });

        }

    }

    // Append the customerList to the customerProfile output
    output.apiCalls.customerGet.data.customer_list = siteDef.data.customerList;

    // Create the output display for the customerGet (display the details of the OOBO customer)
    output.outputDisplay.customerGet = createOOBOCustomerDisplayOutput(output.apiCalls.customerGet.data);

    // Exit and render the processing results
    resolve(output);

});
