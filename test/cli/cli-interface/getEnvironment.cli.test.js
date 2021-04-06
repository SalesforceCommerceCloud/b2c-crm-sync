'use strict';

// Initialize constants
const assert = require('chai').assert;
const config = require('config');

// Initialize helper libraries
const cmd = require('../../../lib/qa/cmd');
const parseCLICommand = require('../../../lib/qa/util/_parseCLICommand');
const parseCLICommandOutput = require('../../../lib/qa/util/_parseCLICommandOutput');

describe('Get Runtime Environment via the CLI', function () {

    // Initialize local variables
    let cliCommand,
        errorObj,
        responseJSON,
        assembledResponse,
        validProperties,
        threwJSONError;

    // First, get the CLI components
    // eslint-disable-next-line mocha/no-setup-in-describe
    cliCommand = parseCLICommand('npm run crm-sync:env:list -- -om json');

    it('should provide a JSON string representing the environment', async function () {

        // Capture the CLI command output
        cmd.execute(
            cliCommand.command,
            cliCommand.args
        )

            // Handle the promise and parse the response
            .then(function (response) {

                // Default the JSON error flag
                threwJSONError = false;

                // Rebuild the output object
                assembledResponse = parseCLICommandOutput(response);

                // Validate the CLI output is well-formed and what was expected
                try {

                    // Attempt to parse-out the JSON string
                    responseJSON = JSON.parse(assembledResponse);

                } catch (errorObj) {

                    // Callout that an error related to JSON parsing was caught
                    threwJSONError = true;

                }

                // Assert that parsing the JSON object did not throw an error
                assert.isTrue((threwJSONError === false), ` -- expected 'false', but instead captured ${JSON.stringify(errorObj)}`);

            });

    });

    it('returns an Environment Definition with all the expected attributes', async function () {

        // Capture the CLI command output
        cmd.execute(
            cliCommand.command,
            cliCommand.args
        )

            // Handle the promise and parse the response
            .then(function (response) {

                // Rebuild the output object and parse-out the JSON string
                assembledResponse = parseCLICommandOutput(response);
                responseJSON = JSON.parse(assembledResponse);

                // Retrieve the valid environment-definition properties
                validProperties = config.util.toObject(config.get('unitTests.cliOutputValidationAttributes.getEnvironment'));

                // Validate that the environment definition has the required keys
                assert.hasAnyKeys(responseJSON, validProperties);

            });

    });

});
