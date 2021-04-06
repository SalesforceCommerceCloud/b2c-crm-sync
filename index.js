'use strict';

// Expose the getRuntimeEnvironment method via an API wrapper
exports.getRuntimeEnvironment = require('./lib/cli-api/_getRuntimeEnvironment');

// Expose the verify B2C Commerce sites method via an API wrapper
exports.verifyB2CSites = require('./lib/cli-api/_b2cSitesVerify');

// Expose the list B2C Commerce code versions method via an API wrapper
exports.b2cCodeVersionsList = require('./lib/cli-api/_b2cCodeVersionsList');

// Expose the ability to verify the configured code version via an API wrapper
exports.b2cCodeVersionVerify = require('./lib/cli-api/_b2cCodeVersionVerify');

// Expose the ability to activate code versions via an API wrapper
exports.b2cCodeVersionActivate = require('./lib/cli-api/_b2cCodeVersionActivate');

// Expose the ability to toggle code versions via an API wrapper
exports.b2cCodeVersionToggle = require('./lib/cli-api/_b2cCodeVersionToggle');

// Expose the ability to verify site and code-versions exist
exports.b2cVerify = require('./lib/cli-api/_b2cVerify');

// Expose the ability to verify b2c authentication via OCAPI is possible
exports.b2cAuthClientCredentials = require('./lib/cli-api/_b2cAuthClientCredentials');

// Expose the ability to setup the B2C Commerce deployment folders
exports.b2cDeploySetup = require('./lib/cli-api/_b2cDeploySetup');

// Expose the ability to reset the contents of the B2C deploy folder
exports.b2cDeployReset = require('./lib/cli-api/_b2cDeployReset');

// Expose the ability to deploy the meta-data to the B2C Commerce instance
exports.b2cDeployData = require('./lib/cli-api/_b2cDeployData');

// Expose the ability to deploy the code-version to the B2C Commerce instance
exports.b2cDeployCode = require('./lib/cli-api/_b2cDeployCode');

// Expose the ability to zip / archive B2C Commerce content
exports.b2cZip = require('./lib/cli-api/_b2cZip');

// Expose the ability to remove cartridges from the site cartridge-paths
exports.b2cSitesCartridgesRemove = require('./lib/cli-api/_b2cSitesCartridgesRemove');

// Expose the ability to add cartridges to the site cartridge-paths
exports.b2cSitesCartridgesAdd = require('./lib/cli-api/_b2cSitesCartridgesAdd');

// Expose the ability to generate the sfcc services meta-data template
exports.b2cServicesCreate = require('./lib/cli-api/_b2cServicesCreate');

// Expose the ability to generate the sfdx connected-apps meta-data template
exports.sfConnectedAppsCreate = require('./lib/cli-api/_sfConnectedAppsCreate');

// Expose the ability to generate the sfdx TrustedSites meta-data template
exports.sfTrustedSitesCreate = require('./lib/cli-api/_sfTrustedSitesCreate');

// Expose the ability to generate the sfdx remoteSiteSettings meta-data template
exports.sfRemoteSitesCreate = require('./lib/cli-api/_sfRemoteSitesCreate');

// Expose the ability to generate the sfdx named credentials for B2CAM meta-data template
exports.sfNamedCredentialsAMCreate = require('./lib/cli-api/_sfNamedCredentialsAMCreate');

// Expose the ability to generate the sfdx named credentials for B2C OOBO meta-data template
exports.sfNamedCredentialsOOBOCreate = require('./lib/cli-api/_sfNamedCredentialsOOBOCreate');

// Expose the ability to authenticate against a Salesforce Instance using user-credentials
exports.sfAuthUserCredentials = require('./lib/cli-api/_sfAuthUserCredentials');

// Expose the ability to create scratchOrgs driven by the crm-sync repositories
exports.sfScratchOrgCreate = require('./lib/cli-api/_sfScratchOrgCreate');

// Expose the ability to deploy the b2c-crm-sync code to a scratchOrg
exports.sfScratchOrgDeploy = require('./lib/cli-api/_sfScratchOrgDeploy');

// Expose the ability to retrieve the details for a given scratchOrg
exports.sfScratchOrgDetails = require('./lib/cli-api/_sfScratchOrgDetails');

// Expose the ability to open a specified b2c-rm-sync scratchOrg
exports.sfScratchOrgOpen = require('./lib/cli-api/_sfScratchOrgOpen');

// Expose the ability to view the remote status for a specified b2c-rm-sync scratchOrg
exports.sfScratchOrgStatus = require('./lib/cli-api/_sfScratchOrgStatus');
