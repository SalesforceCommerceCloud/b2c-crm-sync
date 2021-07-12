'use strict';

// Expose the getRuntimeEnvironment method via an API wrapper
exports.getRuntimeEnvironment = require('./_getRuntimeEnvironment');

// Expose the verify B2C Commerce sites method via an API wrapper
exports.verifyB2CSites = require('./_b2cSitesVerify');

// Expose the list B2C Commerce code versions method via an API wrapper
exports.b2cCodeVersionsList = require('./_b2cCodeVersionsList');

// Expose the ability to verify the configured code version via an API wrapper
exports.b2cCodeVersionVerify = require('./_b2cCodeVersionVerify');

// Expose the ability to activate code versions via an API wrapper
exports.b2cCodeVersionActivate = require('./_b2cCodeVersionActivate');

// Expose the ability to toggle code versions via an API wrapper
exports.b2cCodeVersionToggle = require('./_b2cCodeVersionToggle');

// Expose the ability to create the B2C Commerce OOBO Customer profiles
exports.b2cOOBOCustomersCreate = require('./_b2cOOBOCustomersCreate');
exports.b2cOOBOCustomersVerify = require('./_b2cOOBOCustomersVerify');
exports.b2cOOBOCustomerDelete = require('./_b2cOOBOCustomerDelete');

// Expose the ability to retrieve and update the OOBO configuration sitPreferences
exports.b2cOOBOSitePrefsUpdate = require('./_b2cOOBOSitePrefsUpdate');
exports.b2cOOBOSitePrefsGet = require('./_b2cOOBOSitePrefsGet');

// Expose the ability to verify site and code-versions exist
exports.b2cVerify = require('./_b2cVerify');

// Expose the ability to verify b2c authentication via OCAPI is possible
exports.b2cAuthClientCredentials = require('./_b2cAuthClientCredentials');
exports.b2cAuthBMUser = require('./_b2cAuthBMUser');
exports.b2cAuthJWT = require('./_b2cAuthJWT');

// Expose the ability to retrieve and update OCAPI configuration(s)
exports.b2cOCAPIGet = require('./_b2cOCAPIConfigGet');

// Expose the ability to setup the B2C Commerce deployment folders
exports.b2cDeploySetup = require('./_b2cDeploySetup');

// Expose the ability to reset the contents of the B2C deploy folder
exports.b2cDeployReset = require('./_b2cDeployReset');

// Expose the ability to deploy the meta-data to the B2C Commerce instance
exports.b2cDeployData = require('./_b2cDeployData');

// Expose the ability to deploy the code-version to the B2C Commerce instance
exports.b2cDeployCode = require('./_b2cDeployCode');

// Expose the ability to zip / archive B2C Commerce content
exports.b2cZip = require('./_b2cZip');

// Expose the ability to remove cartridges from the site cartridge-paths
exports.b2cSitesCartridgesRemove = require('./_b2cSitesCartridgesRemove');

// Expose the ability to add cartridges to the site cartridge-paths
exports.b2cSitesCartridgesAdd = require('./_b2cSitesCartridgesAdd');

// Expose the ability to generate the sfcc services meta-data template
exports.b2cServicesCreate = require('./_b2cServicesCreate');

// Expose the ability to generate the sfdx connected-apps meta-data templates
exports.sfConnectedAppsGet = require('./_sfConnectedAppsGet');
exports.sfConnectedAppsCreate = require('./_sfConnectedAppsCreate');

// Expose the ability to retrieve duplicateRules from the Salesforce org
exports.sfDuplicateRuleCreate = require('./_sfDuplicateRuleCreate');
exports.sfDuplicateRulesGet = require('./_sfDuplicateRulesGet');
exports.sfDuplicateRuleGet = require('./_sfDuplicateRuleGet');

// Expose the ability to generate the sfdx TrustedSites meta-data template
exports.sfTrustedSitesCreate = require('./_sfTrustedSitesCreate');

// Expose the ability to generate the sfdx remoteSiteSettings meta-data template
exports.sfRemoteSitesCreate = require('./_sfRemoteSitesCreate');

// Expose the ability to generate the sfdx named credentials for B2C OOBO meta-data template
exports.sfNamedCredentialsOOBOCreate = require('./_sfNamedCredentialsOOBOCreate');

// Expose the ability to authenticate against a Salesforce Instance using user-credentials
exports.sfAuthUserCredentials = require('./_sfAuthUserCredentials');

// Expose the ability to create a B2C ClientID seed-record using environment file definitions
exports.sfB2CClientIDGet = require('./_sfB2CClientIDGet');
exports.sfB2CClientIDCreate = require('./_sfB2CClientIDCreate');
exports.sfB2CClientIDUpdate = require('./_sfB2CClientIDUpdate');

// Expose the ability to create a B2C Instance seed-record using environment file definitions
exports.sfB2CInstanceGet = require('./_sfB2CInstanceGet');
exports.sfB2CInstanceCreate = require('./_sfB2CInstanceCreate');
exports.sfB2CInstanceUpdate = require('./_sfB2CInstanceUpdate');

// Expose the ability to create the B2C Instance child records
exports.sfB2CInstanceSetup = require('./_sfB2CInstanceSetup');

// Expose the ability to create scratchOrgs driven by the crm-sync repositories
exports.sfScratchOrgCreate = require('./_sfScratchOrgCreate');

// Expose the ability to delete a given scratchOrg
exports.sfScratchOrgDelete = require('./_sfScratchOrgDelete');

// Expose the ability to push the b2c-crm-sync code to a scratchOrg
exports.sfScratchOrgPush = require('./_sfScratchOrgPush');

// Expose the ability to deploy specific code elements to a scratchOrg
exports.sfOrgDeploy = require('./_sfOrgDeploy');

// Expose the ability to retrieve the details for a given scratchOrg
exports.sfOrgDetails = require('./_sfOrgDetails');

// Expose the ability to open a specified b2c-rm-sync scratchOrg
exports.sfOrgOpen = require('./_sfOrgOpen');

// Expose the ability to view the remote status for a specified b2c-rm-sync scratchOrg
exports.sfOrgStatus = require('./_sfOrgStatus');

// Expose the ability to retrieve the details for a given user
exports.sfUserDetails = require('./_sfUserDetails');

// Expose the ability to reset a user's password
exports.sfUserPasswordReset = require('./_sfUserPasswordReset');

// Expose the ability to assign a permission-set to a given user
exports.sfUserPermsetAssign = require('./_sfUserPermsetAssign');

// Expose the ability to reset the B2C Site-specific OOBO customer properties
exports.sfOOBOB2CSitesReset = require('./_sfOOBOB2CSitesReset');
exports.sfOOBOB2CSitesUpdate = require('./_sfOOBOB2CSitesUpdate');
