'use strict';

// Initialize constants
const config = require('config');

// Include the helper library to retrieve the environment details
const sfdcAuth = require('../apis/sfdc/auth');
const sObjectAPIs = require('..//apis/sfdc/sObject');

/**
 * @function _sfAuthProviderCreate
 * @description Attempts to create a version of the ClientCredentials Named Credential SFDX
 * metadata template leveraging environment data provided.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = async environmentDef => {
    const connectionResult = await sfdcAuth.authUserCredentials(environmentDef.sfLoginUrl, environmentDef.sfUsername, environmentDef.sfPassword, environmentDef.sfSecurityToken);

    return sObjectAPIs.create(connectionResult.conn, 'AuthProvider', {
        AuthorizeUrl: `${config.get('b2c.accountManager.baseUrl')}${config.get('b2c.accountManager.authorizeUrl')}`,
        TokenUrl: `${config.get('b2c.accountManager.baseUrl')}${config.get('b2c.accountManager.authUrl')}`,
        ConsumerKey: environmentDef.b2cClientId,
        ConsumerSecret: environmentDef.b2cClientSecret,
        DeveloperName: environmentDef.b2cInstanceName,
        FriendlyName: environmentDef.b2cInstanceName,
        ProviderType: 'OpenIdConnect',
        OptionsIncludeOrgIdInId: false,
        OptionsSendAccessTokenInHeader: true,
        OptionsSendClientCredentialsInHeader: false,
        OptionsSendSecretInApis: true
    });
};
