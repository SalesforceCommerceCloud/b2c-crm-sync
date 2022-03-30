'use strict';

var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site');

/**
 * @function afterPOST
 * @description This hook is used to synchronize customer registrations with the Salesforce
 * Platform triggered by OCAPI / headless interactions
 *
 * @param {dw/customer/Customer} customer Represents the customer being registered
 * @param {Object} customerRegistration Describes the post used to register a customer
 * @returns {Status} Returns the status for the OCAPI request
 */
// eslint-disable-next-line no-unused-vars
function afterPOST(customer, customerRegistration) {
    if (!Site.getCurrent().getCustomPreferenceValue('b2ccrm_syncCustomersViaOCAPI') || !customer.isAuthenticated() || !require('dw/system/HookMgr').hasHook('app.customer.created')) {
        return new Status(Status.OK);
    }

    var LOGGER = Logger.getLogger('int_b2ccrmsync', 'hooks.ocapi.shop.customer.afterPOST');
    // Call out that we're executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Customer Registration: Start: Sync via OCAPI');
    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.customer.created', 'created', customer.getProfile());
    // Call out that we're done executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Customer Registration: Stop: Sync via OCAPI');
    // Return an ok-status (authorizing the creation)
    return new Status(Status.OK);
}

/**
 * @function afterPATCH
 * @description This hook is used to synchronize customer profile updates with the
 * Salesforce Platform triggered by OCAPI / headless interactions
 *
 * @param {dw/customer/Customer} customer Represents the customer being updated
 * @param {Object} customerRegistration Describes the post used to update the customer profile
 * @returns {Status} Returns the status for the OCAPI request
 */
// eslint-disable-next-line no-unused-vars
function afterPATCH(customer, customerRegistration) {
    if (!Site.getCurrent().getCustomPreferenceValue('b2ccrm_syncCustomersViaOCAPI') || !customer.isAuthenticated() || !require('dw/system/HookMgr').hasHook('app.customer.updated')) {
        return new Status(Status.OK);
    }

    var LOGGER = Logger.getLogger('int_b2ccrmsync', 'hooks.ocapi.shop.customer.afterPATCH');
    // Call out that we're executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Customer Profile Update: Syncing Customer Profile via OCAPI');
    // Invoke the customer-process hook -- and pass-in the created customer-record
    require('dw/system/HookMgr').callHook('app.customer.updated', 'updated', customer.getProfile());
    // Call out that we're done executing the customer-profile sync
    LOGGER.info('-- B2C-CRM-Sync: Customer Profile Update: Finish: Sync via OCAPI');
    // Return an ok-status (authorizing the update)
    return new Status(Status.OK);
}

/**
 * @function modifyGETResponse
 * @description This hook is used to improve the customer response while fetching the customer.
 * This allows to provide more data to the Core Platform.
 *
 * @param {dw/customer/Customer} customer Represents the customer being updated
 * @param {Object} customerResponse Represents the response from the API
 * @returns {Status} Returns the status for the OCAPI request
 */
// eslint-disable-next-line no-unused-vars
function modifyGETResponse(customer, customerResponse) {
    if (!Site.getCurrent().getCustomPreferenceValue('b2ccrm_syncEnhanceOCAPICustomerResponse')) {
        return new Status(Status.OK);
    }

    var expand = request.getHttpParameters().custom_expand || [];
    if (expand.indexOf('promotions') > -1) {
        var PromotionMgr = require('dw/campaign/PromotionMgr');
        var promotionPlan = PromotionMgr.getActiveCustomerPromotions();
        customerResponse.c_active_promotions = promotionPlan.getPromotions().toArray().map(function (promotion) {
            return promotion.getID();
        });
    }

    return new Status(Status.OK);
}

module.exports.afterPOST = afterPOST;
module.exports.afterPATCH = afterPATCH;
module.exports.modifyGETResponse = modifyGETResponse;
