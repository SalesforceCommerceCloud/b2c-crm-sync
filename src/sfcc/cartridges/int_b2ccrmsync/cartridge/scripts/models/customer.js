// noinspection FunctionWithMultipleReturnPointsJS

'use strict';

/**
 * @description The SFCC Quota on number of entries within a set-of-string is 200, so ensure we never exceed it
 * @type {Number}
 */
var MAX_SET_ENTRIES = 200;

/**
 * @constructor
 * @description Customer class
 * @alias module:models/customer~Customer
 * @param {dw/customer/Profile} [profile] Profile Represents the B2C Commerce customer profile
 */
function Customer(profile) {

    // Initialize local variables
    var profileDef;

    /** @type {dw/customer/Profile} */
    this.profile = profile;

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

    // Was a profile defined?
    if (this.profile) {

        /** @type {profileDef} */
        profileDef = {
            B2C_Customer_ID__c: this.profile.getCustomer().getID().toString(),
            B2C_Customer_No__c: this.profile.getCustomerNo().toString(),
            FirstName: this.profile.getFirstName().toString(),
            LastName: this.profile.getLastName().toString(),
            Email: this.profile.getEmail().toString(),
            B2C_CustomerList_ID__c: require('dw/customer/CustomerMgr').getSiteCustomerList().getID().toString()
        };

        // Send the Salesforce Core Account Id in case of update, or null in case of creation
        if (this.profile.custom.b2ccrm_accountId !== null) {
            profileDef.AccountId = this.profile.custom.b2ccrm_accountId;
        }

        // Send the Salesforce Core Contact Id in case of update, or null in case of creation
        if (this.profile.custom.b2ccrm_contactId !== null) {
            profileDef.Id = this.profile.custom.b2ccrm_contactId;
        }

        // Persist the profile definition
        this.profileRequestObjectRepresentation = profileDef;

    }

    // Initialize the API container
    var api = {};

    /**
     * @function getRetrieveRequestBody
     * @description Builds up the request body for the retrieve REST API operation
     *
     * @param {Object} profileDetails The profile details as raw object, overrides the {profile} from the
     * model in the generated request body if provided
     * @returns {String} Returns the body used to invoke the B2CContactResolve service
     */
    api.getRetrieveRequestBody = function (profileDetails) {
        if (!profileDetails && !this.profile) { return undefined; }
        return JSON.stringify({
            inputs: [{
                ContactList: [profileDetails || this.profileRequestObjectRepresentation]
            }]
        });
    };

    /**
     * @function getProcessRequestBody
     * @description Builds up the request body for the process REST API operation
     *
     * @returns {String} Returns the body to be used by the B2CContactProcess serviceRequest
     */
    api.getProcessRequestBody = function () {
        if (!this.profile) { return undefined; }
        return JSON.stringify({
            inputs: [{
                sourceContact: this.profileRequestObjectRepresentation
            }]
        });
    };

    /**
     * @function updateStatus
     * @description Update the {custom.b2ccrm_syncStatus} attribute with the given {status}
     *
     * @param {String} status The status to save on the profile
     */
    api.updateStatus = function (status) {
        if (!this.profile) { return; }
        require('dw/system/Transaction').wrap(function () {
            this.profile.custom.b2ccrm_syncStatus = status;
        }.bind(this));
    };

    /**
     * @function updateExternalId
     * @description Update the {custom.b2ccrm_accountId} and {custom.b2ccrm_contactId} attribute
     * with the given {accountID} and {contactID} from the Salesforce Platform
     *
     * @param {String} accountID The Salesforce Core account ID to save on the customer profile
     * @param {String} contactID The Salesforce Core contact ID to save on the customer profile
     */
    api.updateExternalId = function (accountID, contactID) {
        if (!this.profile) { return; }
        require('dw/system/Transaction').wrap(function () {
            if (accountID) { this.profile.custom.b2ccrm_accountId = accountID; }
            if (contactID) { this.profile.custom.b2ccrm_contactId = contactID; }
        }.bind(this));
    };

    /**
     * @function updateSyncResponseText
     * @description Update the {custom.b2ccrm_syncResponseText} attribute with the given {text}
     *
     * @param {String} text The text to save within the sync-response-text set-of-string on the profile
     */
    api.updateSyncResponseText = function (text) {
        if (!this.profile) { return; }
        require('dw/system/Transaction').wrap(function () {
            var syncResponseText = (this.profile.custom.b2ccrm_syncResponseText || []).slice(0);
            var thisDate = new Date();
            syncResponseText.push(require('dw/util/StringUtils').format('{0}: {1}', thisDate.toUTCString(), text));
            // In case the number of values is exceeding the quota, remove the oldest entry
            if (syncResponseText.length >= MAX_SET_ENTRIES) { syncResponseText.shift();}
            this.profile.custom.b2ccrm_syncResponseText = syncResponseText;
        }.bind(this));

    }

    // Return the exposed functions
    return api;

}

module.exports = Customer;
