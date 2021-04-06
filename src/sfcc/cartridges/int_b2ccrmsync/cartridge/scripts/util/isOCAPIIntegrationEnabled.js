'use strict';

/**
 * This returns true if the OCAPI based integration with the Salesforce Platform is enabled or false otherwise
 *
 * @return {Boolean}
 */
function isOCAPIIntegrationEnabled() {
    var Site = require('dw/system/Site').getCurrent();
    return Site.getCustomPreferenceValue('b2ccrm_syncCustomersViaOCAPI');
}

module.exports = isOCAPIIntegrationEnabled;
