/* eslint-disable no-underscore-dangle */
'use strict';

// Initialize module dependencies
const config = require('config');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const common = require('../../lib/cli-api/_common');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function b2cBuild
 * @description This function is generates the meta-data, deploy the meta-data and deploy the code to the B2C Commerce instance
 * Commands are abstracted in this manner to facilitate unit testing of each command separately.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {
    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:b2c:build')
        .requiredOption(
            config.get('cliOptions.b2cHostName.cli'),
            config.get('cliOptions.b2cHostName.description'),
            getProgramOptionDefault('b2cHostName')
        )
        .requiredOption(
            config.get('cliOptions.b2cClientId.cli'),
            config.get('cliOptions.b2cClientId.description'),
            getProgramOptionDefault('b2cClientId')
        )
        .requiredOption(
            config.get('cliOptions.b2cClientSecret.cli'),
            config.get('cliOptions.b2cClientSecret.description'),
            getProgramOptionDefault('b2cClientSecret')
        )
        .option(
            config.get('cliOptions.b2cCertificatePath.cli'),
            config.get('cliOptions.b2cCertificatePath.description'),
            getProgramOptionDefault('b2cCertificatePath')
        )
        .option(
            config.get('cliOptions.b2cCertificatePassphrase.cli'),
            config.get('cliOptions.b2cCertificatePassphrase.description'),
            getProgramOptionDefault('b2cCertificatePassphrase')
        )
        .requiredOption(
            config.get('cliOptions.b2cCodeVersion.cli'),
            config.get('cliOptions.b2cCodeVersion.description'),
            getProgramOptionDefault('b2cCodeVersion')
        )
        .requiredOption(
            config.get('cliOptions.b2cSiteIds.cli'),
            config.get('cliOptions.b2cSiteIds.description'),
            getProgramOptionDefault('b2cSiteIds')
        )
        .requiredOption(
            config.get('cliOptions.sfHostName.cli'),
            config.get('cliOptions.sfHostName.description'),
            getProgramOptionDefault('sfHostName')
        )
        .requiredOption(
            config.get('cliOptions.sfLoginUrl.cli'),
            config.get('cliOptions.sfLoginUrl.description'),
            getProgramOptionDefault('sfLoginUrl')
        )
        .requiredOption(
            config.get('cliOptions.sfUsername.cli'),
            config.get('cliOptions.sfUsername.description'),
            getProgramOptionDefault('sfUsername')
        )
        .requiredOption(
            config.get('cliOptions.sfPassword.cli'),
            config.get('cliOptions.sfPassword.description'),
            getProgramOptionDefault('sfPassword')
        )
        .requiredOption(
            config.get('cliOptions.sfSecurityToken.cli'),
            config.get('cliOptions.sfSecurityToken.description'),
            getProgramOptionDefault('sfSecurityToken')
        )
        .description('Generates the meta-data, deploy the meta-data and deploy the code to the ' +
            'B2C Commerce instance -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize constants
            const commandOptions = commandObj.opts();

            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            // Generate the validation results for all dependent attributes
            const b2cConnProperties = common.getB2CConnProperties(environmentDef);
            const b2cCodeProperties = common.getB2CCodeVersion(environmentDef);

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to build the B2C Commerce environment for b2c-crm-sync]',
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    b2cConnProperties,
                    config.get('errors.b2c.badEnvironment'));

                // Were any validation errors found with the code properties?
                cliUi.validateConnectionProperties(
                    b2cCodeProperties,
                    config.get('errors.b2c.badEnvironment'));

                // Sequence of the build
                // 1. Reset the deployment folders
                // 2. Generate the services.xml file
                // 3. Zip the meta-data
                // 4. Deploy the meta-data
                // 5. Zip the code
                // 6. Deploy the code
                // 7. Reset the deployment folders, again, to free-up space
                // 8. Add the cartridges to the cartridge path of the sites

                // Retrieve and output the results of the setup activity
                let resultObj = await cliAPI.b2cDeploySetup();

                // Render the reset results
                console.log(' -- Deployment reset results');
                cliUi.outputResults(
                    resultObj.map(result => result.outputDisplay),
                    undefined,
                    'cliTableConfig.pathsSummary');

                // Generate the B2C Commerce service template
                let serviceCreateResults = await cliAPI.b2cServicesCreate(environmentDef);
                cliUi.outputTemplateResults(serviceCreateResults, undefined);

                // Retrieve and output the results of the reset activity
                let deployResetResults = await cliAPI.b2cDeployReset(
                    config.get('paths.b2cLabel'), config.get('paths.metadataPathLabel'));

                // Audit the deployment-reset results
                console.log(' -- Metadata deployment reset results');
                cliUi.outputResults(
                    [deployResetResults.outputDisplay],
                    undefined,
                    'cliTableConfig.pathsSummary');

                // Archive the B2C Commerce meta-data
                let b2cZipResults = await cliAPI.b2cZip(
                    environmentDef,
                    config.get('paths.b2cLabel'),
                    config.get('paths.metadataPathLabel'));

                // Audit the zip-results
                console.log(' -- Metadata zipping results');
                cliUi.outputResults(
                    [b2cZipResults.outputDisplay],
                    undefined,
                    'cliTableConfig.zipSummary');

                // Deploy the B2C meta-data
                let deployDataResults = await cliAPI.b2cDeployData(
                    environmentDef,
                    config.get('paths.b2cLabel'),
                    config.get('paths.metadataPathLabel'));

                // Output the meta-data deployment results
                cliUi.outputResults(
                    [deployDataResults.outputDisplay.authenticate],
                    undefined,
                    'cliTableConfig.b2cAuthTokenOutput');

                // Output the data import results
                cliUi.outputResults(
                    [deployDataResults.outputDisplay.import],
                    undefined,
                    'cliTableConfig.dataDeploymentOutput');

                // Retrieve and output the results of the reset activity
                let deployDataResetResults = await cliAPI.b2cDeployReset(
                    config.get('paths.b2cLabel'),
                    config.get('paths.cartridgePathLabel'));

                // Audit the code-deployment results
                console.log(' -- Code deployment reset results');
                cliUi.outputResults(
                    [deployDataResetResults.outputDisplay],
                    undefined,
                    'cliTableConfig.pathsSummary');

                // Archive the B2C Commerce code-versions
                let b2cZipCartridgeResults = await cliAPI.b2cZip(
                    environmentDef,
                    config.get('paths.b2cLabel'),
                    config.get('paths.cartridgePathLabel'));

                // Audit the cartridge / code zip-results
                console.log(' -- Code zipping results');
                cliUi.outputResults(
                    [b2cZipCartridgeResults.outputDisplay],
                    undefined,
                    'cliTableConfig.zipSummary');

                // Verify and output the configured B2C Commerce code version
                let deployCodeResults = await cliAPI.b2cDeployCode(
                    environmentDef,
                    config.get('paths.b2cLabel'),
                    config.get('paths.cartridgePathLabel'));

                // Audit the code deployment results
                cliUi.outputResults(
                    [deployCodeResults.outputDisplay.authenticate],
                    undefined,
                    'cliTableConfig.b2cAuthTokenOutput');

                // Audit the codeVersion results
                cliUi.outputResults(
                    [deployCodeResults.outputDisplay.codeVersionGet],
                    undefined,
                    'cliTableConfig.codeVersionOutput');

                // Execute the B2C deployment
                let deploySetupResults = await cliAPI.b2cDeploySetup();
                console.log(' -- Deployment reset results');
                cliUi.outputResults(
                    deploySetupResults.map(result => result.outputDisplay),
                    undefined,
                    'cliTableConfig.pathsSummary');

                // Add the cartridges to the site's cartridge paths
                let cartridgeAddResults = await cliAPI.b2cSitesCartridgesAdd(environmentDef);

                // Was at least one site validated / verified?
                if (cartridgeAddResults.outputDisplay.verifySites.success.length > 0) {

                    // Render the site verification details for success sites
                    console.log(' -- Sites verification details - successfully verified these sites');
                    cliUi.outputResults(
                        cartridgeAddResults.outputDisplay.verifySites.success,
                        undefined,
                        'cliTableConfig.siteOutput');

                }

                // Were any site-validation errors caught?
                if (cartridgeAddResults.outputDisplay.verifySites.error.length > 0) {

                    // Render the site verification details for error sites
                    console.log(' -- Failed to verify the following B2C Commerce Storefronts');
                    cliUi.outputResults(
                        cartridgeAddResults.outputDisplay.verifySites.error,
                        undefined,
                        'cliTableConfig.siteErrors');

                }

                // Provide a status of what's being processed
                console.log(' -- Cartridge add operation details');
                cliUi.outputB2CCartridgeAddResults(cartridgeAddResults, undefined);

                // Output the success message
                cliUi.outputResults();

                // Only output the helper guidance if we can resolve the prefix safely
                if (environmentDef.sfHostName.indexOf('my.salesforce.com') !== -1) {

                    // Remove the suffix form the hostname and use this as the orgUrlPrefix
                    let salesforceOrgUrlPrefix = environmentDef.sfHostName.replace('my.salesforce.com', '');

                    // Output the allowed-origins update for the Salesforce org
                    console.log(' -- Copy the following snippet to your OCAPI Shop and DATA "allowed origins" settings');
                    console.log(' -- as part of the configuration for the "Order on Behalf Of" use-case');
                    console.log('');
                    console.log('    "allowed_origins": [');
                    console.log(`        "https://${salesforceOrgUrlPrefix}lightning.force.com",`);
                    console.log(`        "https://${salesforceOrgUrlPrefix}my.salesforce.com"`);
                    console.log('    ],');
                    console.log('');
                    console.log(' -- This update is required in order to allow Service Agents to authenticate against');
                    console.log(' -- this B2C Commerce instance and log into the storefront on-behalf of customers');
                    console.log('');

                }

            } catch (e) {

                // Output the error details
                cliUi.outputResults(undefined, e);

            } finally {

                // Close-out the bookend collection
                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
