'use strict';

// Initialize constants
const config = require('config');

/**
 * @function getOperationMode
 * @description Attempts to validate that the specified operationMode falls within
 *
 * @param {String} commandOptionValue Represents the command-option specified via the CLI argument
 * @return {String} Returns the valid value for the operationMode processing
 */
module.exports = commandOptionValue => config.get('operationMode.validModes').indexOf(commandOptionValue) !== -1 ? commandOptionValue : config.get('operationMode.default');
