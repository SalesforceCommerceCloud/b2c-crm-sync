'use strict';

// Include local libraries
const flowAPI = require('../../lib/apis/sfdc/flow');

/**
 * @function _sfB2CInstanceSetup
 * @description Attempts to create the child B2C Instance records (CustomerLists and Sites)
 * from the Salesforce Org by invoking a Flow-based REST API.
 *
 * @param {Object} environmentDef Represents the environment definition to use during processing
 * @param {Object} sfAuth Describes the Salesforce authCredentials to use
 *
 * @returns {Object} Returns the instance-setup processing results
 */
module.exports = async (environmentDef, sfAuth) => {

    // Initialize local variables
    let output = {
        apiResults: {},
        outputDisplay: {},
        customerLists: {},
        sites: {}
    };

    // Process the instance setup and return the results
    output.apiResults = await flowAPI.b2cInstanceSetup(environmentDef, sfAuth.accessToken);

    // Shorthand the data elements
    output.data = output.apiResults.data[0];

    // Evaluate the output results
    if (output.data.outputValues.success === true) {

        // Build-out the site and customerList collections (combining the customerList / site results)
        output.customerLists = output.data.outputValues.createdB2CCustomerLists.concat(
            output.data.outputValues.updatedB2CCustomerLists);
        output.sites = output.data.outputValues.createdB2CSites.concat(output.data.outputValues.updatedB2CSites);

        // Shorthand the sites and customerlists that were created
        let createdB2CCustomerLists = output.data.outputValues.createdB2CCustomerLists.map(thisObj => thisObj.CustomerList_ID__c),
            createdB2CSites = output.data.outputValues.createdB2CSites.map(thisObj => thisObj.Name),
            updatedB2CCustomerLists = output.data.outputValues.updatedB2CCustomerLists.map(thisObj => thisObj.CustomerList_ID__c),
            updatedB2CSites = output.data.outputValues.updatedB2CSites.map(thisObj => thisObj.Name);

        // Provide defaults for each of the status variables
        if (createdB2CCustomerLists.toString().length === 0) { createdB2CCustomerLists = '---'; }
        if (createdB2CSites.toString().length === 0) { createdB2CSites = '---'; }
        if (updatedB2CCustomerLists.toString().length === 0) { updatedB2CCustomerLists = '---'; }
        if (updatedB2CSites.toString().length === 0) { updatedB2CSites = '---'; }

        // Build the output success-display
        output.outputDisplay = [
            ['b2cInstance', environmentDef.b2cInstanceName],
            ['b2cInstanceId', output.data.outputValues.b2cInstance.Id],
            ['instanceType', output.data.outputValues.b2cInstance.Instance_Type__c],
            ['success', output.data.outputValues.success],
            ['created customerLists', createdB2CCustomerLists.toString()],
            ['created sites', createdB2CSites.toString()],
            ['updated customerLists', updatedB2CCustomerLists.toString()],
            ['updated sites', updatedB2CSites.toString()]
        ];

    } else {

        // Build the output error-display
        output.outputDisplay = [
            ['b2cInstance', environmentDef.b2cInstanceName],
            ['success', output.data.outputValues.success],
            ['error message', (output.data.outputValues.errorMessage === null) ? '' : output.data.outputValues.errorMessage]
        ];

    }

    // Return the output details
    return output;

};
