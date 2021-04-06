'use strict';

/**
 * @function _findActive
 * @description Iterates over the collection of code-versions retrieved from the B2C environment
 * and finds the code-version configured as active.
 *
 * @param {[{data: Object}]} codeVersions Represents the collection of code-versions retrieved from the B2C environment
 * @returns {String|undefined} Returns the code version identified as active
 */
module.exports = codeVersions => codeVersions.data.filter(codeVersion => codeVersion.active === true);
