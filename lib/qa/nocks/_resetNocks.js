'use strict';

/**
 * @private
 * @function _resetNocks
 * @description Helper function used to reset nocks in-between unit tests
 * @param {Object} nock Represents the nock instance being reset
 * @param {Function} processCallback Represents the mocha done() function indicating the reset is complete
 */
function _resetNocks(nock, processCallback) {

    // Clean any pending requests -- and start over
    nock.abortPendingRequests();
    nock.cleanAll();

    // Disable network connections
    nock.disableNetConnect();

    // Signal completion of pre-tasks
    processCallback();

}

module.exports = _resetNocks;
