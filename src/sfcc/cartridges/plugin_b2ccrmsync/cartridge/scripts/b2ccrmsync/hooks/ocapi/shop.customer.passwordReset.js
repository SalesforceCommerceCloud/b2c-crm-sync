'use strict';

var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site');

/**
 * @function afterPOST
 * @description This hook is used to reset a customer's password from a Salesforce Core Platform action
 * Platform triggered by OCAPI / headless interactions
 *
 * @param {Object} customer Represents the customer for whom we are reseting the password
 * @param {String} resetToken Represents the token of the reset password
 * @returns {Status} Returns the status for the OCAPI request
 */
// eslint-disable-next-line no-unused-vars
function afterPOST(customer, resetToken) {
    if (!Site.getCurrent().getCustomPreferenceValue('b2ccrm_syncPasswordResetEnabled') || !customer.getProfile()) {
        return new Status(Status.OK);
    }

    var LOGGER = Logger.getLogger('int_b2ccrmsync', 'hooks.ocapi.shop.customer.passwordReset.afterPOST');
    // Call out that we're executing the customer customer reset password flow
    LOGGER.info('-- B2C-CRM-Sync: Password Reset: Start: Reset customer password through OCAPI');
    // Invoke the SFRA account helper to send the reset password email to the customer
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');
    accountHelpers.sendPasswordResetEmail(customer.getProfile().getEmail(), customer);
    // Call out that we're done executing the customer reset password flow
    LOGGER.info('-- B2C-CRM-Sync: Password Reset: Stop: Reset customer password through OCAPI');
    // Return an ok-status (authorizing the creation)
    return new Status(Status.OK);
}

module.exports.afterPOST = afterPOST;
