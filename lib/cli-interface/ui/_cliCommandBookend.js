'use strict';

// Initialize local variables
const config = require('config');

/**
 * @function _cliCommandBookend
 * @description This function is used to generate the CLI command visual bookend that
 * outlines the command execution via the CLI
 *
 * @param {String} commandDescription Describes the name of the command being executed
 * @param {String} bookendType Describes the bookendType (start or end)
 */
module.exports = (commandDescription, bookendType) => {
    // Output the bookend display to the console
    console.log('----------------------------------------------------------------------------');
    console.log(` CRM-SYNC | v${config.get('versionNo')} | ${commandDescription}: ${bookendType.toUpperCase()}`);
    console.log('----------------------------------------------------------------------------');
};
