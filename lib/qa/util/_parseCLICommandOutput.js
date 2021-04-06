'use strict';

// Initialize constants
const { EOL } = require('os');

/**
 * @function _parseCLICommandOutput
 * @description Parses a streaming console-out response and removes the first
 * two lines containing the CLI declaration
 *
 * @param {String} cliResponse Represents the captured raw CLI response
 * @return {String} Returns the CLI output minus the first lines containing the CLI command
 */
function _parseCLICommandOutput(cliResponse) {

    // Initialize local variables
    let responseArray,
        responseOutput;

    // Split the response into a line-by-line array
    responseArray = cliResponse.trim().split(EOL);

    // Remove the opening lines from the CLI output
    responseArray = responseArray.slice(3, responseArray.length);

    // Take the refined responseArray and join the output
    responseOutput = responseArray.join('');

    // Return the response output
    return responseOutput;

}

// Expose the mock for future use
module.exports = _parseCLICommandOutput;
