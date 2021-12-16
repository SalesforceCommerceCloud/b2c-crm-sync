'use strict';

/**
 * @module models/order
 */

/**
 * @object {Class}
 * @typedef Order This class is used to manage B2C Customer profile and REST API orchestration
 * activities between B2C Commerce and the Salesforce Platform when an order is placed
 * @property {Function} getRequestBody Builds up the request body for the REST API operation
 * @property {Function} getProcessRequestBody Builds up the request body for the retrieve REST API operation
 * @property {Function} updateStatus Save / write the integration status on the profile being interacted with
 * @property {Function} updateExternalId Update the AccountId and ContactId attributes from the Salesforce Platform
 * @property {Function} updateSyncResponseText Audit a given synchronization event with a message and timestamp
 *
 * @constructor
 * @param {dw.customer.Order} [order] Order Represents the order being placed via B2C Commerce
 */

function Order(order) {

    /** @type {dw.order.Order} */
    this.order = order;

    // Exit early if no orders have been created
    if (!this.order) {
        return;
    }

    /**
     * @typedef {Object} profileDef Represents the profile-definition to be shared with the Salesforce Platform
     * @property {String} B2C_CustomerList_ID__c Describes the parent customerList this profile is attached to
     * @property {String} FirstName Describes the firstName attached to the customer profile
     * @property {String} LastName Describes the lastName attached to the customer profile
     * @property {String} Email Describes the emailAddress attached to the customer profile
     * @property {String} [AccountId] Describes the Salesforce parent AccountID for the synchronized Account / Contact Pair
     * @property {String} [Id] Describes the Salesforce ContactID that is a child to the parent Account
     */

    // Create the profile representation for the customer that placed the order
    this.profileRequestObjectRepresentation = {
        FirstName: this.order.getBillingAddress().getFirstName(),
        LastName: this.order.getBillingAddress().getLastName(),
        Email: this.order.getCustomerEmail(),
        B2C_CustomerList_ID__c: require('dw/customer/CustomerMgr').getSiteCustomerList().getID()
    };
}

Order.prototype = {
    /**
     * @description Builds up the request body for the REST API operation
     *
     * @returns {String} Returns the body used to invoke the service
     */
    getRequestBody: function () {
        if (!this.profileRequestObjectRepresentation) { return undefined; }
        return JSON.stringify({
            inputs: [{
                sourceContact: this.profileRequestObjectRepresentation
            }]
        });
    },

    /**
     * @description Update the {custom.b2ccrm_syncStatus} attribute with the given {status}
     *
     * @param {String} status Represents the status to save on the order
     */
    updateStatus: function (status) {
        if (!this.order) { return; }
        require('dw/system/Transaction').wrap(function () {
            this.order.custom.b2ccrm_syncStatus = status;
        }.bind(this));
    },

    /**
     * @description Update the {custom.b2ccrm_accountId} and {custom.b2ccrm_contactId} attribute
     * with the given {accountID} and {contactID}
     *
     * @param {String} accountID The Salesforce Core account ID to save on the order
     * @param {String} contactID The Salesforce Core contact ID to save on the order
     */
    updateExternalId: function (accountID, contactID) {
        if (!this.order) { return; }
        require('dw/system/Transaction').wrap(function () {
            if (accountID) {
                this.order.custom.b2ccrm_accountId = accountID;
            }
            if (contactID) {
                this.order.custom.b2ccrm_contactId = contactID;
            }
        }.bind(this));
    },

    /**
     * @description Update the {custom.b2ccrm_syncResponseText} attribute with the given {text}
     *
     * @param {String} text The text to save within the sync-response-text set-of-string on the order
     */
    updateSyncResponseText: function (text) {
        if (!this.order) { return; }
        require('dw/system/Transaction').wrap(function () {
            var syncResponseText = (this.order.custom.b2ccrm_syncResponseText || []).slice(0);
            syncResponseText.push(require('dw/util/StringUtils').format('{0}: {1}', (new Date()).toUTCString(), text));
            // In case the number of values is exceeding the quota, remove the oldest entry
            if (syncResponseText.length >= require('*/cartridge/scripts/b2ccrmsync/util/helpers').MAX_SET_ENTRIES) {
                syncResponseText.shift();
            }
            this.order.custom.b2ccrm_syncResponseText = syncResponseText;
        }.bind(this));
    }
};

module.exports = Order;
