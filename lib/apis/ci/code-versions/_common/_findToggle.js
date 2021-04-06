'use strict';

/**
 * @private
 * @function _findToggle
 * @description Iterates over the collection of code-versions retrieved from the B2C environment
 * and finds the first in-active version
 *
 * @param {Array} codeVersions Represents the collection of code-versions retrieved from the B2C environment
 * @param {Boolean} [toggleValue] Describes the active-status being sought-out via the toggle
 * @returns {String|undefined} Returns the first code-version not flagged as active
 */
module.exports = (codeVersions, toggleValue = false) => codeVersions.filter(codeVersion => codeVersion.active === toggleValue)[0];
