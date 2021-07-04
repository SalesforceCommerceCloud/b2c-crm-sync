'use strict';

/**
 * @module scripts/jobs/synchronizeCustomers
 */

var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'jobs.customers');
var STATUS = {
    NO_DATA: 'NO_DATA_TO_EXPORT'
};

/**
 * Synchronize the customer profiles with the Salesforce Core Platform by leveraging the existing synchronization logic.
 *
 * @param {Object} parameters The parameters from the job configuration.
 *
 * @returns {dw/system/Status} The status of the job
 */
function synchronize(parameters) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Status = require('dw/system/Status');
    var StepUtil = require('int_b2ccrmsync/cartridge/scripts/util/stepUtils');

    if (StepUtil.isDisabled(parameters)) {
        return new Status(Status.OK, 'SKIP', 'Step disabled, skip it...');
    }

    var query = parameters.Query;
    if (query) {
        query = StepUtil.replacePlaceholders(query);
    }
    var limit = parameters.Limit;
    var successCounter = 0;
    var errorCounter = 0;

    /**
     * Synchronize the given {profile} with the Salesforce Core Platform
     * Creating this function as an inner function of the "synchronize" function to have the {counter} variable available in the scope
     *
     * @param {dw/customer/Profile} profile The profile to synchronize
     */
    function synchronizeProfile(profile) {
        if (!profile) {
            return;
        }

        // Ensure we don't hit the limit
        if (limit > 0 && (successCounter + errorCounter) >= limit) {
            LOGGER.info('Profile no {0} has been skipped as the job already reached the configured limit of {1}.', customerNo, limit);
            return;
        }

        var customerNo = profile.getCustomerNo();
        var success = require('dw/system/HookMgr').callHook('app.customer.synchronized', 'synchronized', profile);

        if (success) {
            LOGGER.info('Profile no {0} has been successfully synchronized.', customerNo);
            successCounter++;
            return;
        }

        LOGGER.error('Failed to synchronize the profile {0}. Error: {1}', customerNo);
        errorCounter++;
    }

    /**
     * Leverage the [processProfiles](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_customer_CustomerMgr.html#dw_customer_CustomerMgr_processProfiles_Function_String_Object_DetailAnchor)
     * method as it is not limited to 1000 records as the [searchProfiles](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_customer_CustomerMgr.html#dw_customer_CustomerMgr_searchProfiles_String_String_Object_DetailAnchor) method.
     */
    CustomerMgr.processProfiles(synchronizeProfile, query || require('../b2ccrmsync.config').jobs.customers.defaultQuery);

    // No data have been found from the query, abort
    if (successCounter === 0 && errorCounter === 0) {
        return new Status(Status.OK, 'NO_DATA', 'No profiles to export, abort...')
    }

    LOGGER.info('{0} profiles have been successfully synchronized.', successCounter);
    LOGGER.info('{0} profiles have been not synchronized due to an error.', errorCounter);

    if (errorCounter === 0 && successCounter > 0) { // Everything went well
        return new Status(Status.OK, 'OK');
    } else if (successCounter === 0 && errorCounter > 0) { // No profiles have been synchronized
        return new Status(Status.ERROR, 'ERROR');
    }

    return new Status(Status.OK, 'PARTIAL', 'Some profiles have not been synchronized, please check the logs...');
}

module.exports.synchronize = synchronize;
