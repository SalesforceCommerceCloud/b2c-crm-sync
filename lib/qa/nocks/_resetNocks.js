'use strict';

/**
 * @private
 * @function resetNocks
 * @description Helper function used to reset nocks in-between unit tests
 *
 * @param {Object} nock Represents the nock instance being reset
 * @param {Function} processCallback Represents the mocha done() function indicating the reset is complete
 *@returns {Function} Returns the execution of the invoked processCallback() function
 */
function resetNocks(nock, processCallback) {

    // Clean any pending requests -- and start over
    nock.abortPendingRequests();
    nock.cleanAll();

    // Disable network connections
    nock.disableNetConnect();

    // Signal completion of pre-tasks
    return processCallback();

}

module.exports = resetNocks;
