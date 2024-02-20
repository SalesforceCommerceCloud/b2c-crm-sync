'use strict';

/**
 * @object {Class}
 * @typedef Customer This class is used to manage B2C Customer profile and REST API orchestration
 * activities between B2C Commerce and the Salesforce Platform
 * @property {Function} getRequestBody Builds up the request body for the REST API operation
 * @property {Function} updateStatus Save / write the integration status on the profile being interacted with
 * @property {Function} updateExternalId Update the AccountId and ContactId attributes from the Salesforce Platform
 * @property {Function} updateSyncResponseText Audit a given synchronization event with a message and timestamp
 *
 * @constructor
 * @param {dw/customer/Profile} [profile] Profile Represents the B2C Commerce customer profile
 */
function Customer(profile) {

    /** @type {dw/customer/Profile} */
    this.profile = profile;

    // Exit early if no provide is provided
    if (!this.profile) { return; }

    /**
     * @typedef {Object} profileDef Represents the profile-definition to be shared with the Salesforce Platform
     * @property {String} B2C_CustomerList_ID__c Describes the parent customerList this profile is attached to
     * @property {String} B2C_Customer_ID__c Describes the internal B2C Commerce Profile identifier
     * @property {String} B2C_Customer_No__c Describes the customer-facing customerNo for the customerList
     * @property {String} FirstName Describes the firstName attached to the customer profile
     * @property {String} LastName Describes the lastName attached to the customer profile
     * @property {String} Email Describes the emailAddress attached to the customer profile
     * @property {String} [AccountId] Describes the Salesforce parent AccountID for the synchronized Account / Contact Pair
     * @property {String} [Id] Describes the Salesforce ContactID that is a child to the parent Account
     */

    /** @type {profileDef} */
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

Customer.prototype = {
    /**
     * @memberOf Customer
     * @function getRequestBody
     * @description Builds up the request body for the REST API operation
     *
     * @param {Object} profileDetails The profile details as raw object, overrides the {profile} from the
     * model in the generated request body if provided
     *
     * @returns {String} Returns the body to be used by the serviceRequest
     */
    getRequestBody: function (profileDetails) {
        return JSON.stringify({
            inputs: [{
                sourceContact: profileDetails || this.profileRequestObjectRepresentation
            }]
        });
    },

    /**
     * @function updateStatus
     * @memberOf Customer
     * @description Update the {custom.b2ccrm_syncStatus} attribute with the given {status}
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
     * @memberOf Customer
     * @function updateExternalId
     * @description Update the {custom.b2ccrm_accountId} and {custom.b2ccrm_contactId} attribute
     * with the given {accountID} and {contactID} from the Salesforce Platform
     *
     * @param {String} accountID The Salesforce Core account ID to save on the customer profile
     * @param {String} contactID The Salesforce Core contact ID to save on the customer profile
     */
    updateExternalId: function (accountID, contactID) {
        if (!this.profile) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            if (accountID) { this.profile.custom.b2ccrm_accountId = accountID; }
            if (contactID) { this.profile.custom.b2ccrm_contactId = contactID; }
        }.bind(this));
    },

    /**
     * @memberOf Customer
     * @function updateSyncResponseText
     * @description Update the {custom.b2ccrm_syncResponseText} attribute with the given {text}. The text value should never grow bigger than 50,000 characters
     *
     * @param {String} text The text to save within the sync-response-text json text on the profile
     */
    updateSyncResponseText: function (text) {
        if (!this.profile) {
            return;
        }

        require('dw/system/Transaction').wrap(function () {
            var syncResponseText = require('*/cartridge/scripts/b2ccrmsync/util/helpers').expandJSON(this.profile.custom.b2ccrm_syncResponseText, []);
            var thisDate = new Date();
            syncResponseText.unshift(require('dw/util/StringUtils').format('{0}: {1}', thisDate.toUTCString(), text));
            var responseHistory = JSON.stringify(syncResponseText, null, 2);
            while (responseHistory.length > 50000) {
                syncResponseText.pop();
                responseHistory = JSON.stringify(syncResponseText, null, 2);
            }
            this.profile.custom.b2ccrm_syncResponseText = JSON.stringify(syncResponseText, null, 2);
        }.bind(this));

    }

};

module.exports = Customer;
