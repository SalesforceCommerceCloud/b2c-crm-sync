/* eslint-disable no-underscore-dangle */
'use strict';

// Initialize module dependencies
const config = require('config');
const sfdx = require('sfdx-node');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');
const common = require('../../lib/cli-api/_common/');
const commonFs = require('../../lib/_common/fs');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @private
 * @function calculateDuplicateRulesTemplatePath
 * @description Helper function to establish the duplicateRule templatePath for
 * the current scratchOrg profile being processed
 *
 * @param {String} sfScratchOrgProfile Represents the current scratchOrg profile and
 * contactModel being employed for the install
 * @returns {String} Returns the templatePath for the duplicateRule templates
 */
function calculateDuplicateRulesTemplatePath(sfScratchOrgProfile) {
    return `${config.get('paths.source.dx.templates')}duplicateRules/${sfScratchOrgProfile}/`;
}

/**
 * @private
 * @function calculateDuplicateRulesDeployPath
 * @description Helper function to establish the duplicateRule deployPath for
 * the current scratchOrg profile being processed
 *
 * @param {String} sfScratchOrgProfile Represents the current scratchOrg profile and
 * contactModel being employed for the install
 * @returns {String} Returns the deployPath for the duplicateRule templates
 */
function calculateDuplicateRulesDeployPath(sfScratchOrgProfile) {
    return `./src/sfdc/${sfScratchOrgProfile}${config.get('paths.source.dx.deployPath')}duplicateRules/`;
}

/**
 * @private
 * @function calculateDuplicateRulesTmpPath
 * @description Helper function to establish the duplicateRule TMP for
 * the current scratchOrg profile being processed
 *
 * @returns {String} Returns the temporary working path for the duplicateRule templates
 */
function calculateDuplicateRulesTmpPath() {
    return `${config.get('paths.source.dx.templates')}duplicateRules/_tmp/`;
}

/**
 * @function duplicateRulesCreate
 * @description This function is used to create the SFDC duplicateRules to deploy to
 * the Salesforce org.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:duplicaterules')
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
        .requiredOption(
            config.get('cliOptions.sfScratchOrgProfile.cli'),
            config.get('cliOptions.sfScratchOrgProfile.description'),
            getProgramOptionDefault('sfScratchOrgProfile')
        )
        .description('Generate the SFDX Duplicate Rules to be deployed to the Salesforce Org ' +
            '-- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {

            // Initialize the command options
            const commandOptions = commandObj.opts();
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const sfConnProperties = common.getSFUserCredConnProperties(environmentDef);
            const output = {};

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to create and deploy b2c-crm-sync duplicateRules to the Salesforce Org',
                    environmentDef);

                // Were any validation errors found with the connection properties?
                cliUi.validateConnectionProperties(
                    sfConnProperties,
                    config.get('errors.sf.badEnvironment'));

                // Are the SF authCredentials valid and usable?
                output.sfAuthResults = await cliUi.validateSFAuth(environmentDef);

                // Audit that we're pull existing rules for analysis
                console.log(' -- Retrieving existing duplicateRules from the Salesforce Org');

                // Evaluate the scratchOrg profile to calculate the deployment path for duplicate rules
                output.duplicateRulesTemplatePath = calculateDuplicateRulesTemplatePath(environmentDef.sfScratchOrgProfile);
                output.duplicateRulesDeployPath = calculateDuplicateRulesDeployPath(environmentDef.sfScratchOrgProfile);
                output.duplicateRulesTmpPath = calculateDuplicateRulesTmpPath();

                // Initialize the deployment and temporary working folder for the current scratchOrg model
                await commonFs.verifyAndCreateFolder(output.duplicateRulesDeployPath);
                await commonFs.verifyAndCreateFolder(output.duplicateRulesTmpPath);

                // Evaluate the scratchOrg profile to decide how to deploy duplicateRules
                if (environmentDef.sfScratchOrgProfile === config.get('sfScratchOrg.paProfile')) {

                    let foo = 123;

                } else {

                    // Retrieve the duplicateRules from the source Salesforce org
                    output.duplicateRuleResults = await cliAPI.sfDuplicateRulesGet(
                        output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                        'Contact');

                    // Audit that we're pull existing rules for analysis
                    console.log(' -- Creating new and modifying existing duplicateRules for b2c-crm-sync');

                    // Create standardContact duplicate rule
                    output.standardContactDuplicateRule = await cliAPI.sfDuplicateRuleCreate(
                        output.duplicateRulesTemplatePath,
                        output.duplicateRulesDeployPath,
                        output.duplicateRulesTmpPath,
                        output.duplicateRuleResults,
                        'Contact',
                        'Standard_Contact_Duplicate_Rule',
                        0);

                    // Was processing this duplicate rule successful?
                    if (output.standardContactDuplicateRule.success === true) {

                        // If so, output the details
                        cliUi.outputTemplateResults(
                            {
                                success: true,
                                filePath: output.standardContactDuplicateRule.deployPath,
                                fileContents: output.standardContactDuplicateRule.renderedTemplate
                            },
                            undefined);

                    }

                    // Create B2C Commerce contact duplicate rule
                    output.b2cCommerceContactDuplicateRule = await cliAPI.sfDuplicateRuleCreate(
                        output.duplicateRulesTemplatePath,
                        output.duplicateRulesDeployPath,
                        output.duplicateRulesTmpPath,
                        output.duplicateRuleResults,
                        'Contact',
                        'B2C_Commerce',
                        1);

                    // Was processing this duplicate rule successful?
                    if (output.b2cCommerceContactDuplicateRule.success === true) {

                        // If so, output the details
                        cliUi.outputTemplateResults(
                            {
                                success: true,
                                filePath: output.b2cCommerceContactDuplicateRule.deployPath,
                                fileContents: output.b2cCommerceContactDuplicateRule.renderedTemplate
                            },
                            undefined);

                    }

                    // Did any errors occur?  If not, then go ahead and deploy
                    if (output.b2cCommerceContactDuplicateRule.success === true &&
                        output.standardContactDuplicateRule.success === true) {

                        // Submit that we're deploying the duplicate rules to the Salesforce org
                        console.log(' -- Deploying the configured duplicate rules to the Salesforce Org');

                        // Attempt to deploy the duplicate rules
                        await sfdx.force.source.deploy({
                            sourcepath: output.duplicateRulesDeployPath
                        });

                        // Output the deployment results message
                        cliUi.outputResults();

                        // Retrieve the duplicateRules from the source Salesforce org
                        output.thisDuplicateRule = await cliAPI.sfDuplicateRuleGet(
                            output.sfAuthResults.apiCalls.sfAuthenticate.authResults.conn,
                            'Contact',
                            'B2C_Commerce');

                        // Define the duplicateRule setupUrl (for direct access to editing / configuration)
                        output.ruleUrl = `https://${environmentDef.sfHostName}/lightning/setup/DuplicateRules/page?` +
                            `address=%2F${output.thisDuplicateRule.records[0].Id}%3Fsetupid%3DDuplicateRules`;

                        // Provide guidance on using the url to complete the configuration of the duplicateRule
                        console.log(' -- Complete the configuration of your duplicate rule and add the required filter-logic');
                        console.log(' -- Open the "B2C Commerce" Contact duplicate rule via this url');
                        console.log(` -- ${output.ruleUrl}`);
                        console.log(' -- Edit the rule and scroll to the "Filter Logic" field at the bottom of the display');
                        console.log(' -- Paste the following rule definition in the duplicate rule\'s filter-logic field:');
                        console.log('');
                        console.log('    1 OR (2 AND 3) OR (2 AND 4 AND 5) OR (2 AND 4) OR (4 AND 5 AND 6)');
                        console.log('');
                        console.log(' -- Click "Save" to apply your changes (easy-peasy-lemon-squeezy)');

                    } else {

                        // Or, alert that an error occurred (errors should be visible)
                        console.log(' -- Unable to deploy the duplicateRules to your Salesforce Org');
                        console.log(' -- Please check the error(s) for these rules and try again ');

                    }

                }

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;

};
