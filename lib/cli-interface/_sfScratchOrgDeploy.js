'use strict';

// Initialize module dependencies
const config = require('config');
const logo = require('asciiart-logo');

// Initialize the CLI api
const cliAPI = require('../../index');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

// Retrieve the helper function that calculates the default program option value
const getOperationMode = require('../../lib/cli-api/_common/_getOperationMode');
const getProgramOptionDefault = require('../../lib/cli-api/_common/_getProgramOptionDefault');

/**
 * @function deployToScratchOrg
 * @description This function is used to initially deploy code to a sfdx scratch org using a configured profile.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:deploy')
        .option(config.get('cliOptions.sfScratchOrgUsername.cli'), config.get('cliOptions.sfScratchOrgUsername.description'), getProgramOptionDefault('sfScratchOrgUsername'))
        .option(config.get('cliOptions.sfScratchOrgForceOverwrite.cli'), config.get('cliOptions.sfScratchOrgForceOverwrite.description'), getProgramOptionDefault('sfScratchOrgForceOverwrite'))
        .option(config.get('cliOptions.operationMode.cli'), config.get('cliOptions.operationMode.description'), getOperationMode, getProgramOptionDefault('operationMode'))
        .description('Deploy SFDC b2c-crm-sync code to the specified scratch-org via the CLI -- defaults to the .env; can be overridden via the CLI')
        .action(async commandObj => {
            const commandOptions = commandObj.opts();
            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment(commandOptions);
            const isJSONOperationMode = commandOptions.operationMode === config.get('operationMode.json');
            const output = {};

            try {
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'start');
                    console.log(' -- Attempting to deoploy B2C CRM Sync to the scratch org using the following environment details');
                    cliUi.outputEnvironmentDef(environmentDef);
                }

                // Retrieve the scratch org details
                let resultObj = await cliAPI.sfScratchOrgDetails(environmentDef);
                if (!isJSONOperationMode) {
                    output.scratchOrgDetails = resultObj;
                } else {
                    cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDetails');
                }

                // Capture the scratch org status
                const localCommandOpts = environmentDef;
                localCommandOpts.statusLocal = true;
                localCommandOpts.statusRemote = false;
                resultObj = await cliAPI.sfScratchOrgStatus(localCommandOpts);
                if (!isJSONOperationMode) {
                    output.scratchOrgStatus = resultObj;
                } else {
                    cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDeployResults');
                }

                // Deploy the b2c-crm-sync code the scratchOrg
                console.log(' -- deploying to the specified scratch org; please standby');
                resultObj = await cliAPI.sfScratchOrgDeploy(environmentDef);
                if (!isJSONOperationMode) {
                    output.scratchOrgDeploy = resultObj;
                }

                // Capture the scratch org status
                localCommandOpts.statusLocal = false;
                localCommandOpts.statusRemote = true;
                resultObj = await cliAPI.sfScratchOrgStatus(localCommandOpts);
                if (!isJSONOperationMode) {
                    output.scratchOrgStatus = resultObj;
                } else {
                    cliUi.outputResults(resultObj.outputDisplay, undefined, 'cliTableConfig.scratchOrgDeployResults');
                }

                // Print the output in case of JSON mode, which is an aggregate of all the subsequent results
                if (isJSONOperationMode) {
                    console.log('%s', JSON.stringify(output, null, 2));
                } else {
                    console.log(logo({
                        name: 'SUCCESS!',
                        font: 'Electronic',
                        lineChars: 10,
                        padding: 2,
                        margin: 2,
                        borderColor: 'black',
                        logoColor: 'bold-green',
                        textColor: 'green'
                    })
                        .emptyLine()
                        .right('- Brought to You by the Full Power of Salesforce Architects')
                        .right('Architect Success, SCPPE, Services, & Alliances')
                        .emptyLine()
                        .render()
                    );
                }
            } catch (e) {
                console.log(
                    logo({
                        name: 'FAILED!',
                        font: 'Electronic',
                        lineChars: 10,
                        padding: 2,
                        margin: 2,
                        borderColor: 'black',
                        logoColor: 'bold-red',
                        textColor: 'red'
                    })
                        .emptyLine()
                        .right('- Inspect Each of the Following Exceptions Reported by SFDX')
                        .right('Validate your MetaData, OrgProfile, and Try Again')
                        .emptyLine()
                        .render()
                );

                cliUi.outputResults(undefined, JSON.stringify(e, null, 4));
            } finally {
                if (!isJSONOperationMode) {
                    cliUi.cliCommandBookend(commandObj._name, 'end');
                }
            }
        });

    // Return the program with the appended command
    return commandProgram;
};
