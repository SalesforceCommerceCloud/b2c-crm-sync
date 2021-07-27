// noinspection ReuseOfLocalVariableJS

'use strict';

// Initialize constants
const config = require('config');
const Table = require('cli-table');
const colors = require('colors');

/**
 * @function _outputB2CCartridgeInEligibleResults
 * @description Helper function to render the cli-table output for sites that
 * are not eligible for cartridgePath additions and removals
 *
 * @param {Object} inEligible Represents the collection of ineligible sites
 * @param {String} [cliTableDefinition] Describes the config-based table definition to use
 */
module.exports = (inEligible, cliTableDefinition = 'cliTableConfig.cartridgeAddErrors') => {
    // Create a reference to the collection of deployable cartridges
    const appCartridges = config.util.toObject(config.get('b2c.cartridges.deploy'));

    inEligible.siteIds.forEach(siteId => {
        let table = new Table(config.get(cliTableDefinition));
        const siteSummary = inEligible.siteDetails[siteId];

        // Were any errors found for the current site?
        if (Object.prototype.hasOwnProperty.call(siteSummary, 'errors')) {
            siteSummary.errors.errorDetails.forEach(siteError => {
                // Add the error details to the output table
                table.push([
                    siteSummary.siteId,
                    siteError.cartridgeName,
                    siteError.errorMessage
                ]);
            });
        }

        // Output the site-specific error messages
        console.log(table.toString());

        // Initialize the cartridge-path details table
        table = new Table(config.get('cliTableConfig.cartridgePathDetails'));

        // Prepend the siteId to the table header
        table.options.head = [siteSummary.siteId + ': ' + table.options.head];
        let cartridgeLine = '';

        siteSummary.data.cartridges.split(':').forEach(cartridge => {
            const isInAppCartridgePath = appCartridges.some(path => path.name === cartridge);
            if (isInAppCartridgePath) {
                // If so, then highlight the cartridge
                // eslint-disable-next-line no-param-reassign
                cartridge = colors.inverse(cartridge);
            }

            // Should we skip this line and create a new one?
            if (cartridgeLine.length > 90) {
                // If so, then add the line and start a new one
                table.push([cartridgeLine]);
                cartridgeLine = '';

            }

            cartridgeLine = cartridgeLine + `${cartridgeLine.length === 0 ? '' : ':'}${cartridge}`;
        });

        // Output the cartridge-path details for the current site
        console.log(table.toString());
    });
};
