'use strict';

/**
 * @module util/helpers
 */

/**
 * @description Expands a JSON String into an object.  Takes a JSON string and attempts
 * to deserialize it.  A default value can be applied in the event that deserialization fails.
 *
 * @param {String} jsonString Represents the JSON String being expanded and deserialized.
 * @param {*} defaultValue Represents the default value to be applied to the variable if the JSON
 * string could not be expanded / deserialized.
 * @returns {*} Returns undefined if empty string or exception encountered
 */
function expandJSON(jsonString, defaultValue) {
    var output = defaultValue;
    try {
        output = jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (e) {
        require('dw/system/Logger')
            .getLogger('int_b2ccrmsync', 'util/helpers')
            .error('Error parsing JSON: {0}', e);
    }
    return output;
}

/**
 * @description This returns true if the integration with the Salesforce Platform
 * is enabled or false otherwise
 *
 * @return {Boolean} Returns true if integration is enabled; false if not
 */
function isIntegrationEnabled() {
    var Site = require('dw/system/Site').getCurrent();
    var isSyncEnabled = Site.getCustomPreferenceValue('b2ccrm_syncIsEnabled');
    var isSyncCustomersEnabled = Site.getCustomPreferenceValue('b2ccrm_syncCustomersEnabled');
    return !!(isSyncEnabled && isSyncCustomersEnabled);
}

/**
 * Helper method to identify if the SFDC identifiers are present in a given customerProfile.  Evaluates
 * if the ContactID attribute exists, was set, and has an actual value.
 *
 * @param {dw/customer/Profile} profile
 * @return {Boolean}
 */
function sfdcContactIDIdentifierPresent(profile) {
    // Is the profile empty?
    if (profile === null || profile === undefined) { return false; }

    // Is the contactId present in the profile?
    if (!profile.custom.hasOwnProperty('b2ccrm_contactId')) { return false; }

    // Is the contactId value empty or not set?
    if (profile.custom.b2ccrm_contactId === null || profile.custom.b2ccrm_contactId === undefined) { return false; }

    // Evaluate the length of the SFDC property
    if (profile.custom.b2ccrm_contactId.valueOf().length === 0) { return false; }

    // If all conditions pass, there's a contactId
    return true;
}

module.exports.expandJSON = expandJSON;
module.exports.isIntegrationEnabled = isIntegrationEnabled;
module.exports.sfdcContactIDIdentifierPresent = sfdcContactIDIdentifierPresent;

/**
 * The SFCC Quota on number of entries within a set-of-string is 200, so ensure we never exceed it
 * @type {Number}
 */
module.exports.MAX_SET_ENTRIES = 200;
