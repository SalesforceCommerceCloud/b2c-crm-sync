'use strict';

// Initialize required libraries
const createRuntimeEnvironment = require('../../lib/cli-api/_common/_createRuntimeEnvironment');
const getScratchOrgProfile = require('../../lib/cli-api/_common/_getScratchOrgProfile');
const getScratchOrgAlias = require('../../lib/cli-api/_common/_getScratchOrgAlias');
const getScratchOrgSetDefault = require('../../lib/cli-api/_common/_getScratchOrgSetDefault');
const getScratchOrgForceOverwrite = require('../../lib/cli-api/_common/_getScratchOrgForceOverwrite');
const getScratchOrgDurationDays = require('../../lib/cli-api/_common/_getScratchOrgDurationdays');

// Parse the CLI environment properties
require('dotenv').config();

/**
 * @function _getRuntimeEnvironment
 * @description Attempts to read the CLI-arguments and parse-out the getEnvironment definition
 *
 * @param {Object} [commandOptions] Represents the commandObject arguments passed to this method
 * @return {environmentDef} Returns the environment object -- driven by CLI arguments and the .env settings
 */
module.exports = commandOptions => {
    let output = commandOptions;

    // Was a commandObj specified (ie -- is this being run from the CLI)
    if (output === undefined) {
        // If not, build the environment from the .env file contents
        output = createRuntimeEnvironment(process.env);
    }

    // Check if the hostName is defined and no instance-name override exists, and if so -- derive the instance name
    if ((output.b2cInstanceName === undefined || output.b2cInstanceName.trim().length === 0) && output.hasOwnProperty('b2cHostName') && output.b2cHostName !== undefined) {
        // Automate the calculation of the instanceName -- if an override isn't provided
        output.b2cInstanceName = output.b2cHostName.split('.')[0];
    }

    // Was an instanceName defined?
    if (output.b2cInstanceName !== undefined) {
        // If so, remove any characters that could cause issues with sfdx deployment
        output.b2cInstanceName = output.b2cInstanceName.replace('-', '');
        output.b2cInstanceName = output.b2cInstanceName.replace('.', '');

    }

    // Was a scratch-org profile defined?
    if (output.sfScratchOrgProfile !== undefined) {

        // Validate and automatically default the scratch-org profile to use
        output.sfScratchOrgProfile = getScratchOrgProfile(output.sfScratchOrgProfile);
        output.sfScratchOrgSetDefault = getScratchOrgSetDefault(output.sfScratchOrgSetDefault);
        output.sfScratchOrgAlias = getScratchOrgAlias(output.sfScratchOrgAlias);
        output.sfScratchOrgDurationDays = getScratchOrgDurationDays(output.sfScratchOrgDurationDays);

    }

    // Is the force-overwrite property defined?
    if (output.sfScratchOrgForceOverwrite !== undefined) {

        // If so, validate that this value is a boolean
        output.sfScratchOrgForceOverwrite = getScratchOrgForceOverwrite(output.sfScratchOrgForceOverwrite);

    }

    // If the scratchOrgUsername is defined -- but has no value, remove it from the environment details
    if (output.hasOwnProperty('sfScratchOrgUsername') && output.sfScratchOrgUsername === undefined) {
        delete output.sfScratchOrgUsername;
    }

    return output;
};
