// noinspection NestedFunctionJS

'use strict';

/**
 * @module scripts/jobs/synchronizeCustomers
 */

/**
 * @type {dw/system/Log}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'jobs.customers');

/**
 * @description Synchronize the customer profiles with the Salesforce Platform by
 * leveraging the existing synchronization logic.
 *
 * @param {Object} parameters The parameters from the job configuration.
 * @param {String} parameters.Query Represents the query to use to identify B2C Commerce
 * customerProfiles to synchronize.
 * @param {Number} parameters.Limit Represents the max. number of profiles to process
 * @returns {dw/system/Status} The status of the job
 */
function synchronize(parameters) {

    // Initialize required libraries
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Status = require('dw/system/Status');
    var StepUtil = require('*/cartridge/scripts/b2ccrmsync/util/stepUtils');

    //  Is the current jobStep being skipped?  If so, exit early
    if (StepUtil.isDisabled(parameters)) {
        return new Status(Status.OK, 'SKIP', 'Step disabled, skip it...');
    }

    // Pull-out the synchronization queryParameter and limit values
    var query = parameters.Query;
    if (query) { query = StepUtil.replacePlaceholders(query); }
    var limit = parameters.Limit;

    // Initialize the jobProcessing counters
    var successCounter = 0;
    var errorCounter = 0;

    /**
     * @description Synchronize the given {profile} with the Salesforce Platform
     * Creating this function as an inner function of the "synchronize" function to
     * have the {counter} variable available in the scope
     *
     * @param {dw/customer/Profile} profile The profile to synchronize
     */
    function synchronizeProfile(profile) {
        if (!profile) {
            return;
        }

        // Ensure we don't hit the limit
        if (limit > 0 && (successCounter + errorCounter) >= limit) {
            // noinspection JSUnusedAssignment
            LOGGER.info(
                'Profile no {0} has been skipped as the job already reached the configured limit of {1}.',
                customerNo, limit
            );
            return;
        }

        // Pull the customer profile's customerNo and synchronize
        var customerNo = profile.getCustomerNo();
        var success = require('dw/system/HookMgr').callHook(
            'app.customer.synchronized',
            'synchronized',
            profile
        );

        // Was it successful?
        if (success) {

            // If so, audit the success
            LOGGER.info(
                'Profile no {0} has been successfully synchronized.',
                customerNo
            );

            // Increase the count of successful synchronizations
            successCounter++;
            return;
        }

        // Otherwise, assume an error was thrown and audit it
        LOGGER.error('Failed to synchronize the profile {0}. Error: {1}', customerNo);
        errorCounter++;
    }

    CustomerMgr.processProfiles(
        synchronizeProfile,
        query || require('*/cartridge/scripts/b2ccrmsync.config').jobs.customers.defaultQuery
    );

    // No data have been found from the query, abort
    if (successCounter === 0 && errorCounter === 0) {
        return new Status(Status.OK, 'NO_DATA', 'No profiles to export, abort...');
    }

    LOGGER.info('{0} profiles have been successfully synchronized.', successCounter);
    LOGGER.info('{0} profiles have been not synchronized due to an error.', errorCounter);

    // Everything went well
    if (errorCounter === 0 && successCounter > 0) {
        return new Status(Status.OK, 'OK');
    }

    // No profiles have been synchronized
    if (successCounter === 0 && errorCounter > 0) {
        return new Status(Status.ERROR, 'ERROR');
    }

    // Otherwise, report partial synchronization results
    return new Status(Status.OK, 'PARTIAL', 'Some profiles have not been synchronized, please check the logs...');
}

module.exports.synchronize = synchronize;
