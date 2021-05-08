'use strict';

// Initialize local libraries
const sleep = require('./_sleep');
const b2cCustomersPurge = require('./_b2cCustomersPurge');

/**
 * @function b2cCRMSyneCustomersPurgeManager
 * @description Helper function to globally manage purge representations in the multi-cloud unit-tests
 *
 * @param {Boolean} disablePurge Represents the configuration for the current environment
 * @param {Integer} purgeSleepTimeout Represents the sleepTimeout in ms to employ in between actions
 * @param {String} b2cAdminAuthToken Represents the B2C Commerce authToken to use for REST API requests
 * @param {Object} sfdcAuthCredentials Represents the SFDC credentials to use for REST API requests
 */
module.exports = async (disablePurge, purgeSleepTimeout, b2cAdminAuthToken, sfdcAuthCredentials) => {

    // Is the purge disabled?
    if (disablePurge === true) {

        // Audit to the console that the purge is disabled
        console.log(' -- useCaseProcesses.b2cCustomersPurge() is disabled; test-data is not cleaned-up before / after tests');

    } else {

        // Implement a pause to ensure the PlatformEvent fires
        await sleep(purgeSleepTimeout);

        // Purge the Account / Contact relationships
        await b2cCustomersPurge(b2cAdminAuthToken, sfdcAuthCredentials.conn);

    }

};
