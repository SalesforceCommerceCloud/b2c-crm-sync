'use strict';

// Initialize any constants
const concat = require('concat-stream');

// Include any local libraries
const createProcess = require('./_createProcess');

/**
 * @function execute
 * @description Helper function / promise-wrapper for the childProcess function; returns
 * the CLI output or error details based on the runtime-execution of the CLI command
 *
 * @param {String} cliCommand Describes the name / path-description of the CLI Command
 * @param {Object} args Describes the arguments being passed with the CLI command
 * @param {Object} opts Describes the environment options for the CLI command being executed
 * @returns {Promise} Returns the childProcess promise-results
 */
function execute(cliCommand, args = [], opts = {}) {

    // Default the environment
    const {env = null} = opts;

    // Initialize the process used to execute the command
    const childProcess = createProcess('npm', args, env);

    // Initialize local variables
    let thisPromise;

    // Set the encoding for the CLI command's execution
    childProcess.stdin.setEncoding('utf-8');

    // Initialize the promise wrapper for the CLI command
    thisPromise = new Promise((resolve, reject) => {

        // Was an error thrown?  Return the error
        childProcess.on('error', reject);

        // / Was an error outputted via the console?
        childProcess.stderr.on('data', (result) => {
            console.log(result.toString());
            reject(result.toString());
        });

        // Output the CLI output via the result
        childProcess.stdout.pipe(
            concat(result => {
                resolve(result.toString());
            })
        );

    });

    // Return the command-execution promise
    return thisPromise;

}

// Export the function so that it's available
module.exports = execute;
