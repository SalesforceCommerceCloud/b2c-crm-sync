'use strict';

/**
 * @function parseCLICommand
 * @description Takes a singular CLI command string and breaks it down into
 * two components:  the command binary being called and the arguments
 *
 * @param {String} cliCommandString Represents the complete CLI command to parse
 * @returns {Object} Returns an object containing the command and array-formatted arguments
 * @private
 */
function parseCLICommand(cliCommandString) {

    // Initialize the output variable
    let output,
        cliSegments;

    // Default the output variable
    output = {
        command: undefined,
        args: []
    };

    // Take the command string and split it into segments
    cliSegments = cliCommandString.split(' ');

    // Capture the command as the first CLI argument
    output.command = cliSegments[0];

    // Remove the first element from the array
    output.args = cliSegments.slice(1, cliSegments.length);

    // Return the output variable
    return output;

}

// Expose the mock for future use
module.exports = parseCLICommand;
