// noinspection FunctionWithMultipleReturnPointsJS,FunctionTooLongJS,AssignmentToFunctionParameterJS

'use strict';

/**
 * @module hooks/customer.retrieve
 */

/**
 * @type {dw/system/Log}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'hooks.customer.retrieve');

/**
 * @function customerRetrieve
 * @description Retrieve the profile within the Salesforce Platform based on the given {profileDetails}
 *
 * @param {dw/customer/Profile|Object} profileDetails The profile details to use while retrieving the customer from the Salesforce Platform.
 * Either an SFCC profile, or an object with a key/value pair of required parameters to search in the Salesforce Platform
 * @param {Boolean} saveContactIdOnProfile If this is {true} and the customer is successfully retrieved from the Salesforce Platform, the contact Id is saved on the currently authenticated profile
 * @returns {Object|*} The response object from the Salesforce Platform in case the customer has been successfully retrieved, or undefined otherwise
 */
function customerRetrieve(profileDetails, saveContactIdOnProfile) {
    if (!require('*/cartridge/scripts/b2ccrmsync/util/helpers').isIntegrationEnabled() || !profileDetails) {
        return;
    }

    /**
     * @typedef resultObject Represents the resultObject returned by the B2CContactProcess service
     * @type {Object}
     * @property {Boolean} isSuccess Describes if resolution was successful or not
     * @property {Array} errors Includes any errors returned by the service
     * @property {Object} outputValues Represents the collection of returnValues provided by the service
     * @property {Array.<{Id: String, AccountId: String}>} outputValues.ContactListResolved Describes the collection of resolved contacts
     * @property {Object} outputValues.Contact Describes the Salesforce Contact resolved for the B2C Customer Profile
     * @property {String} outputValues.Contact.Id Represents the primary key of the resolved Salesforce Contact
     * @property {String} outputValues.Contact.AccountId Represents the primary key of the parent Salesforce Account
     */

    saveContactIdOnProfile = !!(saveContactIdOnProfile || false);
    var areDetailsAnInstanceOfProfile = profileDetails instanceof dw.customer.Profile;
    var PROFILE_REQUIRED_KEYS = require('dw/web/Resource').msg('customer.retrieve.required.fields', 'b2ccrmsync', '').split(',').map(function (key) {
        return key.trim();
    });

    try {

        /** @typeof {Customer} */
        var profileModel = new (require('*/cartridge/scripts/b2ccrmsync/models/customer'))(areDetailsAnInstanceOfProfile ? profileDetails : undefined);
        var requestBody;

        if (areDetailsAnInstanceOfProfile) {
            requestBody = profileModel.getRequestBody();
        } else {
            if (!PROFILE_REQUIRED_KEYS.some(function (key) {
                return profileDetails[key];
            })) {
                return;
            }
            requestBody = profileModel.getRequestBody(profileDetails);
        }

        var ServiceMgr = require('*/cartridge/scripts/b2ccrmsync/services/ServiceMgr');
        LOGGER.info('Retrieving the customer profile to Salesforce core. Here is the request body: {0}', requestBody);
        var result = ServiceMgr.callRestService('customer', 'retrieve', requestBody);

        // Error while calling the service
        // The service did not returned a 20x response
        if (result.status !== 'OK') {
            LOGGER.error('Error occurred while retrieving customer profile: {0}({1}): {2}', result.status, result.msg, result.errorMessage);
            return;
        }

        // The flow always return multiple values, but we only get the first one
        var resultObject = result.object[0];

        // The service returned a 20x response, but with an error in the response body
        if (resultObject.isSuccess === false) {
            LOGGER.error('Error occurred while retrieving customer profile: {0}', JSON.stringify(resultObject.errors));
            return;
        }

        // The service returned a 20x response, but with no match on the given request body
        if (!resultObject.outputValues || !resultObject.outputValues.ResolutionCount || resultObject.outputValues.ResolutionCount === 0) {
            LOGGER.error('No Salesforce Core record is matching the given request.');
            return;
        }

        // The retrieve operation succeed, return the result
        LOGGER.info('Successfully retrieved the customer profile. Here is the response body: {0}', JSON.stringify(resultObject));

        // In case the {saveContactIdOnProfile} flag is true and there is a customer authenticated
        // Then save the retrieved contact Id on the currently authenticated customer profile
        if (saveContactIdOnProfile && areDetailsAnInstanceOfProfile) {
            var accountId = resultObject.outputValues.Account.Id;
            var contactId = resultObject.outputValues.Contact.Id;
            profileModel.updateSyncResponseText(require('dw/util/StringUtils').format('Successfully retrieved from Salesforce Platform. Contact ID updated from "{0}" to "{1}"', profileDetails.custom.b2ccrm_contactId, contactId));
            profileModel.updateExternalId(accountId, contactId);
        }

        // Return the retrieve customer profile record from the Salesforce Platform
        return resultObject.outputValues;
    } catch (e) {
        LOGGER.error('Error occurred while retrieving customer profile: {0}', e.message);
    }
}

module.exports.retrieve = customerRetrieve;
