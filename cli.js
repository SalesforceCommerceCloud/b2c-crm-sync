'use strict';

// Initialize any constants
const config = require('config');

// Initialize access to local libraries
const cliInterface = require('./lib/cli-interface');

// Define the current version
let projectVersionNo = config.get('versionNo').toString();

// Initialize the CLI program
let program = require('commander');

// Initialize the .env confirmation
require('dotenv').config();

/**
 * @typedef {Object} commandObj
 * @description Represents a roll-up of the CLI command object and its arguments
 *
 * @property {String} b2cHostName Represents the domain of the B2C Commerce environment being deployed to
 * @property {String} b2cClientId Represents the clientId used to authenticate against the B2C Commerce environment
 * @property {String} b2cClientSecret Represents clientSecret used to authenticate against the B2C Commerce environment
 * @property {String} [b2cCodeVersion] Represents code-version to deploy the B2C Commerce cartridge / plugins to
 * @property {String} [b2cRelease] Represents the specific release being deployed
 * @property {String} [b2cInstanceName] Represents a short-hand name to describe the current B2C Instance
 * @property {String} [b2cUsername] Represents the B2C username used to generate BM Grants leveraged by OCAPI interactions
 * @property {String} [b2cAccessKey] Represents the B2C accessKey used in place of a password to generate BM Grants leveraged by OCAPI interactions
 * @property {String} [operationMode] Describes the mode in which the CLI is being processed (production or testing)
 */

// Initialize the version of the CLI program
program.version(projectVersionNo);

//------------------------------------------------
// Initialize CLI commands
//------------------------------------------------

// Attach the command used to retrieve the complete environment details
program = cliInterface.getEnvironment(program);

////////////////////////////////////////////////////////////////////////////////
// B2C related CI-CLI commands
////////////////////////////////////////////////////////////////////////////////

// Attach the command used to retrieve the environment details
program = cliInterface.b2cGetEnvironment(program);

// Attach the command used to verify B2C Commerce sites
program = cliInterface.b2cVerifySites(program);

// Attach the command used to list the B2C Commerce code versions
program = cliInterface.b2cCodeVersionsList(program);

// Attach the command used to verify the existence of a B2C Commerce code version
program = cliInterface.b2cCodeVersionVerify(program);

// Attach the command used to activate the B2C Commerce code version
program = cliInterface.b2cCodeVersionActivate(program);

// Attach the command used to toggle the active B2C Commerce code version
program = cliInterface.b2cCodeVersionToggle(program);

// Attach the command used to verify that both code-versions and sites exist
program = cliInterface.b2cVerify(program);

// Attach the command used to verify that the configuration can be authed successfully
program = cliInterface.b2cAuthClientCredentials(program);

// Attach the command used to verify the setup of the B2C Commerce deployment folders
program = cliInterface.b2cDeploySetup(program);

// Attach the command used to reset the contents of the B2C Commerce code deployment folder
program = cliInterface.b2cDeployCodeReset(program);

// Attach the command used to reset the contents of the B2C Commerce meta-data deployment folder
program = cliInterface.b2cDeployDataReset(program);

// Attach the command used to deploy meta-data to the B2C Commerce instance
program = cliInterface.b2cDeployData(program);

// Attach the command used to deploy code-version to the B2C Commerce instance
program = cliInterface.b2cDeployCode(program);

// Attach the command used to create and place the cartridge code archive prior to deployment
program = cliInterface.b2cCodeZip(program);

// Attach the command used to create and place the data archive prior to deployment
program = cliInterface.b2cDataZip(program);

// Attach the command used to remove the app-cartridges from the site cartridge-paths
program = cliInterface.b2cSitesCartridgesRemove(program);

// Attach the command used to add the app-cartridges to the site cartridge-paths
program = cliInterface.b2cSitesCartridgesAdd(program);

// Attach the command used to generate the services metadata file based on the template
program = cliInterface.b2cServicesCreate(program);

// Attach the command used to generate the meta-data, deploy the meta-data and deploy the code to the B2C Commerce instance
program = cliInterface.b2cBuild(program);

////////////////////////////////////////////////////////////////////////////////
// SFDX related CI-CLI commands
////////////////////////////////////////////////////////////////////////////////

// Attach the command used to retrieve the environment details
program = cliInterface.sfGetEnvironment(program);

// Attach the command used to retrieve the scratch-org environment details
program = cliInterface.sfGetScratchOrgEnvironment(program);

// Attach the command used to generate the SFDX connected apps template
program = cliInterface.sfConnectedAppsCreate(program);

// Attach the command used to generate the SFDX trusted sites template
program = cliInterface.sfTrustedSitesCreate(program);

// Attach the command used to generate the SFDX remote sites template
program = cliInterface.sfRemoteSitesCreate(program);

// Attach the command used to generate the SFDX B2C Account Manager Auth Provider template
program = cliInterface.sfAuthProviderBuild(program);

// Attach the command used to generate the SFDX B2C Account Manager Auth Provider template
program = cliInterface.sfAuthProviderCreate(program);

// Attach the command used to generate the SFDX B2C Account Manager Named Credentials template
program = cliInterface.sfNamedCredentialsAMCreate(program);

// Attach the command used to generate the SFDX B2C OOBO Named Credentials template
program = cliInterface.sfNamedCredentialsOOBOCreate(program);

// Attach the bulk-command used to generate the SFDX templates
program = cliInterface.sfTemplateSetup(program);

// Attach the command used to exercise authentication via user-credentials
program = cliInterface.sfAuthenticateUserCredentials(program);

// Attach the command used to create a scratch-org
program = cliInterface.sfScratchOrgCreate(program);

// Attach the command used to create a scratch-org and deploy to it
program = cliInterface.sfScratchOrgDeploy(program);

// Attach the command used to retrieve the details for a scratch org
program = cliInterface.sfScratchOrgDetails(program);

// Attach the command used to open a scratch-org
program = cliInterface.sfScratchOrgOpen(program);

// Attach the command used to view the remote status a scratch-org
// program = cliInterface.sfScratchOrgStatus(program);

// Attach the command used to create, build, and deploy to a scratch-org
program = cliInterface.sfScratchOrgBuild(program);

// Attach the command used to display a user's details
program = cliInterface.sfUserDetails(program);

// Parse the command-line arguments
program.parse(process.argv);
