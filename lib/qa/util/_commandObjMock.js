'use strict';

// Initialize constants
const config = require('config');

/**
 * @function _commandObjectMock
 * @description Represents a mock class representation of the commander program.  We
 * use this mock to return a well-structured environment object foundation driven by
 * the parsing of CLI arguments.
 *
 * @param {String} [optsConfig] Describes the mock configuration to leverage
 */
function _commandObjectMock(optsConfig) {

    // Initialize local variables
    let api;

    // Initialize the API
    api = {};

    // Default the configuration to use if one is not defined
    if (optsConfig === undefined) { optsConfig = 'unitTests.opts.default'; }

    // Mock the ops function for our test
    api.opts = function _opts() {
        return config.util.toObject(config.get(optsConfig));
    };

    // Return the API
    return api;

}

// Expose the mock for future use
module.exports = _commandObjectMock;
