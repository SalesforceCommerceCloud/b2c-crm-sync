'use strict';

/**
 * @module models/customer
 */

/**
 * Customer class
 *
 * @constructor
 * @alias module:models/customer~Customer
 *
 * @param {dw/customer/Profile} [profile] Profile object
 */
function Customer(profile) {
    /**
     * @type {dw/customer/Profile}
     */
    this.profile = profile;

    if (!this.profile) {
        return;
    }

    this.profileRequestObjectRepresentation = {
        B2C_Customer_ID__c: this.profile.getCustomer().getID(),
        B2C_Customer_No__c: this.profile.getCustomerNo(),
        FirstName: this.profile.getFirstName(),
        LastName: this.profile.getLastName(),
        Email: this.profile.getEmail(),
        B2C_CustomerList_ID__c: require('dw/customer/CustomerMgr').getSiteCustomerList().getID()
    };

    // Send the Salesforce Core Account Id in case of update, or null in case of creation
    if (this.profile.custom.b2ccrm_accountId !== null) {
        this.profileRequestObjectRepresentation.AccountId = this.profile.custom.b2ccrm_accountId;
    }

    // Send the Salesforce Core Contact Id in case of update, or null in case of creation
    if (this.profile.custom.b2ccrm_contactId !== null) {
        this.profileRequestObjectRepresentation.Id = this.profile.custom.b2ccrm_contactId;
    }
}

/**
 * @alias module:models/customer~Customer#prototype
 */
Customer.prototype = {
    /**
     * Builds up the request body for the retrieve REST API operation
     *
     * @param {Object} profileDetails The profile details as raw object, overrides the {profile} from the model in the generated request body if provided
     *
     * @returns {String}
     */
    getRetrieveRequestBody: function (profileDetails) {
        if (!profileDetails && !this.profile) {
            return undefined;
        }

        return JSON.stringify({
            inputs: [{
                ContactList: [profileDetails || this.profileRequestObjectRepresentation]
            }]
        });
    },

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
     * @param {String} status The status to save on the profile
     */
    updateStatus: function (status) {
        if (!this.profile) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            this.profile.custom.b2ccrm_syncStatus = status;
        }.bind(this));
    },

    /**
     * Update the {custom.b2ccrm_accountId} and {custom.b2ccrm_contactId} attribute with the given {accountID} and {contactID}
     *
     * @param {String} accountID The Salesforce Core account ID to save on the customer profile
     * @param {String} contactID The Salesforce Core contact ID to save on the customer profile
     */
    updateExternalId: function (accountID, contactID) {
        if (!this.profile) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            if (accountID) {
                this.profile.custom.b2ccrm_accountId = accountID;
            }
            if (contactID) {
                this.profile.custom.b2ccrm_contactId = contactID;
            }
        }.bind(this));
    },

    /**
     * Update the {custom.b2ccrm_syncResponseText} attribute with the given {text}
     *
     * @param {String} text The text to save within the sync-response-text set-of-string on the profile
     */
    updateSyncResponseText: function (text) {
        if (!this.profile) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            var syncResponseText = (this.profile.custom.b2ccrm_syncResponseText || []).slice(0);
            syncResponseText.push(require('dw/util/StringUtils').format('{0}: {1}', (new Date()).toGMTString(), text));

            // In case the number of values is exceeding the quota, remove the oldest entry
            if (syncResponseText.length >= require('../util/helpers').MAX_SET_ENTRIES) {
                syncResponseText.shift();
            }

            this.profile.custom.b2ccrm_syncResponseText = syncResponseText;
        }.bind(this));
    }
};

module.exports = Customer;
