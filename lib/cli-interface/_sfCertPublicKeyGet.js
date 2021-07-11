/* eslint-disable no-underscore-dangle */
// noinspection ExceptionCaughtLocallyJS

'use strict';

// Initialize module dependencies
const config = require('config');
const fs = require('fs');
const path = require('path');
const jks = require('jks-js');

// Initialize the prompt modules
const {Select} = require('enquirer');
const {Password} = require('enquirer');

// Initialize the CLI api
const cliAPI = require('../../lib/cli-api/');

// Initialize local libraries
const cliUi = require('../../lib/cli-interface/ui');

/**
 * @function _sfCertPublicKeyGet
 * @description This function is used to parse-out the publicKey from the downloaded Salesforce keyStore.  It will output the
 * contents of the publicKey to the console -- so it can be copied and pasted into the AM ClientID definition.
 *
 * @param {Object} commandProgram Represents the CLI program to which the getEnvironment command is appended
 * @return {Object} Returns the updated commandProgram -- including the command that was just attached
 */
module.exports = commandProgram => {

    // Append the environment-get command to the parent program
    commandProgram
        .command('crm-sync:sf:cert:publickey:get')
        .description('Attempts to parse the publicKey from the downloaded Salesforce self-signed certificate ' +
            'keyStore -- and output its contents to the console.')
        .action(async commandObj => {

            // Initialize local variables
            let certPath,
                certFiles,
                selectedJKS,
                selectedJKSPassword,
                jksFullPath,
                parsedKeyStore,
                keyStoreKeys,
                prompt,
                output;

            // Retrieve the runtime environment
            const environmentDef = cliAPI.getRuntimeEnvironment();

            try {

                // Open the output display
                cliUi.cliCommandBookend(
                    commandObj._name,
                    'start',
                    'Attempting to parse the publicKey from the downloaded Salesforce self-signed cert',
                    environmentDef);

                // Initialize the certPath
                certPath = config.get('paths.source.dx.certs-sfdc').toString();

                // Verify that the sfdx-certs folder exists
                if (!fs.existsSync(certPath)) {
                    throw new Error(`Unable to locate the certificates directory: ${certPath}`);
                }

                console.log(' -- verified the existence of the certificates directory');
                console.log(' -- reading the contents of the folder; looking for javaKeyStores (.jks)');

                // Parse the contents of the directory and identify all the java keyStores
                certFiles = fs.readdirSync(certPath).filter(file => {
                    return path.extname(file).toLowerCase() === '.jks';
                });

                // Was at least one (1) jks found?  If not, throw an error
                if (certFiles.length === 0) {
                    throw new Error(`Unable to find a java keyStore file (.jks extension): ${certPath}`);
                }

                // Only pay attention to the first keyStore file found in the directory
                if (certFiles.length > 1) {

                    // Define the prompt allowing users to select a JKS
                    prompt = new Select({
                        name: 'javaKeyStore',
                        message: 'Please Select a Salesforce JavaKeyStore:',
                        choices: certFiles
                    });

                    // Execute the prompt
                    await prompt.run()
                        .then(answer => { selectedJKS = answer; })
                        .catch(console.error);

                } else {

                    // Otherwise, default the selected javaKeyStore
                    selectedJKS = certFiles[0];

                    // Audit that we found a single javaKeyStore file
                    console.log(` -- found one javaKeyStore (.jks) certificate file: ${selectedJKS}`);

                }

                // Define the prompt used to collect the jks password
                prompt = new Password({
                    name: 'jksPassword',
                    message: 'Please Enter the Password for this JavaKeyStore'
                });

                // Execute the prompt and collect the password
                await prompt.run()
                    .then(answer => { selectedJKSPassword = answer; })
                    .catch(console.error);

                // Build the jks completePath
                jksFullPath = `${certPath}/${selectedJKS}`;

                // parse the javaKeyStore and capture the results
                parsedKeyStore = jks.toPem(fs.readFileSync(jksFullPath), selectedJKSPassword);
                keyStoreKeys = Object.keys(parsedKeyStore);

                // Build the output display
                output = [
                    ['JavaKeyStore File', selectedJKS],
                    ['Full Path', jksFullPath],
                    ['Certificate DeveloperName', keyStoreKeys[0]],
                    ['B2C Client ID', environmentDef.b2cClientId]
                ];

                // Output the jks parsing results
                cliUi.outputResults(output, undefined, 'cliTableConfig.jksSummary');

                console.log(' -- outputting the .env Salesforce Platform Configuration Properties update');
                console.log('######################################################################');
                console.log('## Salesforce Platform Configuration Properties');
                console.log('######################################################################');
                console.log(`SF_HOSTNAME=${environmentDef.sfHostName}`);
                console.log(`SF_LOGINURL=${environmentDef.sfLoginUrl}`);
                console.log(`SF_USERNAME=${environmentDef.sfUsername}`);
                console.log(`SF_PASSWORD=${environmentDef.sfPassword}`);
                console.log(`SF_SECURITYTOKEN=${environmentDef.sfSecurityToken}`);
                console.log(`SF_CERTDEVELOPERNAME=${keyStoreKeys[0]}`);

                console.log();
                console.log(' -- copy the Salesforce certificate DeveloperName to the Salesforce');
                console.log(' -- Platform Configuration Properties of your .env file; we\'ll use');
                console.log(' -- this value to seed default b2cInstance certificate associations');
                console.log();

                console.log(' -- outputting the contents of the Salesforce self-signed certificate');

                // Output the jks Certificate instructions
                console.log('----------------------------------------------------------------------------');
                console.log(` ${selectedJKS}: Certificate Contents: START`);
                console.log('----------------------------------------------------------------------------');
                console.log(parsedKeyStore[keyStoreKeys[0]].cert);
                console.log('----------------------------------------------------------------------------');
                console.log(` ${selectedJKS}: Certificate Contents: END`);
                console.log('----------------------------------------------------------------------------');

                // Provide guidance describing what to do with the certificate contents
                console.log(' -- copy the contents of this certificate including the BEGIN and END tags');
                console.log(' -- to your clipboard and paste this in the Account Manager B2C ClientID');
                console.log(' -- definition via the \'Client JWT Bearer Public Key\' form field');

                // Write the keystore certificate to the sfdc folder using the certificate developerName
                fs.writeFileSync(`${certPath}/${keyStoreKeys[0]}.cert`, parsedKeyStore[keyStoreKeys[0]].cert);
                fs.writeFileSync(`${certPath}/${keyStoreKeys[0]}.key`, parsedKeyStore[keyStoreKeys[0]].key);

            } catch (e) {

                cliUi.outputResults(undefined, e);

            } finally {

                cliUi.cliCommandBookend(commandObj._name, 'end');

            }

        });

    // Return the program with the appended command
    return commandProgram;
};
