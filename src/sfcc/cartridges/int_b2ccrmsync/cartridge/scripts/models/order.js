'use strict';

/**
 * @module models/order
 */

/**
 * Order class
 *
 * @constructor
 * @alias module:models/order~Order
 *
 * @param {dw/order/Order} [order] Order object
 */
function Order(order) {
    /**
     * @type {dw/order/Order}
     */
    this.order = order;

    if (!this.order) {
        return;
    }

    this.profileRequestObjectRepresentation = {
        FirstName: this.order.getBillingAddress().getFirstName(),
        LastName: this.order.getBillingAddress().getLastName(),
        Email: this.order.getCustomerEmail(),
        B2C_CustomerList_ID__c: require('dw/customer/CustomerMgr').getSiteCustomerList().getID()
    };
}

/**
 * @alias module:models/order~Order#prototype
 */
Order.prototype = {
    /**
     * Builds up the request body for the process REST API operation
     *
     * @returns {String}
     */
    getProcessRequestBody: function () {
        if (!this.profileRequestObjectRepresentation) {
            return undefined;
        }

        return JSON.stringify({
            inputs: [{
                sourceContact: this.profileRequestObjectRepresentation
            }]
        });
    },

    /**
     * Update the {custom.b2ccrm_syncStatus} attribute with the given {status}
     *
     * @param {String} status The status to save on the order
     */
    updateStatus: function (status) {
        if (!this.order) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            this.order.custom.b2ccrm_syncStatus = status;
        }.bind(this));
    },

    /**
     * Update the {custom.b2ccrm_accountId} and {custom.b2ccrm_contactId} attribute with the given {accountID} and {contactID}
     *
     * @param {String} accountID The Salesforce Core account ID to save on the order
     * @param {String} contactID The Salesforce Core contact ID to save on the order
     */
    updateExternalId: function (accountID, contactID) {
        if (!this.order) {
            return;
        }

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
     * Update the {custom.b2ccrm_syncResponseText} attribute with the given {text}
     *
     * @param {String} text The text to save within the sync-response-text set-of-string on the order
     */
    updateSyncResponseText: function (text) {
        if (!this.order) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            var syncResponseText = (this.order.custom.b2ccrm_syncResponseText || []).slice(0);
            syncResponseText.push(require('dw/util/StringUtils').format('{0}: {1}', (new Date()).toGMTString(), text));

            // In case the number of values is exceeding the quota, remove the oldest entry
            if (syncResponseText.length >= require('../util/helpers').MAX_SET_ENTRIES) {
                syncResponseText.shift();
            }

            this.order.custom.b2ccrm_syncResponseText = syncResponseText;
        }.bind(this));
    }
};

module.exports = Order;
