'use strict';

// Create an instance of a child process
const spawn = require('child_process').spawn;

/**
 * @function _createProcess
 * @description Helper function used to spawn a CLI Command as a separate process
 *
 * @param {String } command Describes the CLI command being executed
 * @param {Object} args Describes the arguments being passed to this process
 * @param {SpawnOptions} options Describes the environment in which the process is being created
 * @return {childProcess} Returns a process instance
 */
// eslint-disable-next-line no-unused-vars
function _createProcess(command, args = [], options = null) {

    // Initialize local variables
    let thisProcess;

    // Use this as a guide for defining the command / arg combination
    // Command: "npm" | Arguments: ['run','crm-sync:env:list', '--', '-om', 'json']

    // Initialize the process
    thisProcess = spawn(command, args)
        .on('error', function (e) {
            console.log('error');
            console.log(e);
        });

    // Return the process instance
    return thisProcess;

}

// Export the function so that it's available
module.exports = _createProcess;
