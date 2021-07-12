'use strict';

// Initialize required libraries
const createRuntimeEnvironment = require('../../lib/cli-api/_common/_createRuntimeEnvironment');
const getScratchOrgProfile = require('../../lib/cli-api/_common/_getScratchOrgProfile');
const getScratchOrgAlias = require('../../lib/cli-api/_common/_getScratchOrgAlias');
const getScratchOrgSetDefault = require('../../lib/cli-api/_common/_getScratchOrgSetDefault');
const getScratchOrgForceOverwrite = require('../../lib/cli-api/_common/_getScratchOrgForceOverwrite');
const getScratchOrgDurationDays = require('../../lib/cli-api/_common/_getScratchOrgDurationDays');

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

    // First, attempt to default the b2cInstanceName based on what's defined in the .env file
    if (process.env.hasOwnProperty('B2C_INSTANCENAME')) {
        output.b2cInstanceName = process.env.B2C_INSTANCENAME;
    }

    // Check if the hostName is defined and no instance-name override exists, and if so -- derive the instance name
    if ((output.b2cInstanceName === undefined || output.b2cInstanceName.trim().length === 0) &&
        output.hasOwnProperty('b2cHostName') && output.b2cHostName !== undefined) {

        // Automate the calculation of the instanceName -- if an override isn't provided
        output.b2cInstanceName = output.b2cHostName.split('.')[0];

        // Is there a hyphen in the hostName? If so, then split on the first hyphen
        if (output.b2cInstanceName.indexOf('-') > -1) {
            output.b2cInstanceName = output.b2cInstanceName.split('-')[0];
        }

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

    // Has an alternate hostName been defined?  If not, then let's default it
    if (!output.hasOwnProperty('sfHostNameAlt') || output.sfHostNameAlt.length === 0) {

        // Create the sfHostNameAlt property -- if a hostName has been defined
        if (output.hasOwnProperty('sfHostName') && output.sfHostName.indexOf('lightning.force.com') !== -1) {
            output.sfHostNameAlt = output.sfHostName.replace('lightning.force.com', 'my.salesforce.com');
        }

        // Default the alternative hostName property if it's not been defined already
        if (output.hasOwnProperty('sfHostName') && !output.hasOwnProperty('sfHostNameAlt')) {
            output.sfHostNameAlt = output.sfHostName;
        }

    }

    return output;
};
