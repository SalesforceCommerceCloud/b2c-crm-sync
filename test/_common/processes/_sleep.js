'use strict';

/**
 * @function sleep
 * @description Helper function to space-out unit-test operations and create time for
 * asynchronous operations (ex. PlatformEvents) to fire successfully
 *
 * @param timeout {Integer} Represents the timeout to enforce in milliseconds
 * @param showTimeoutMessage {Boolean} Controls whether the timeout message is rendered via the console
 * @return {Promise<unknown>} Returns a promise that enforces the timeout in question
 */
module.exports = (timeout, showTimeoutMessage = false) => {
    // eslint-disable-next-line no-undef
    return new Promise(resolve => {
        setTimeout(() => {

            // Show the timeout message if debugging is enabled
            if (showTimeoutMessage === true) {
                console.log(`-- forcing a pause of ${timeout}ms`);
            }

            resolve();
        }, timeout);
    });
};
