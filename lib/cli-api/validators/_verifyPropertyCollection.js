'use strict';

/**
 * @function _verifyPropertyCollection
 * @description This function is used to verify groups of property collections.  It evaluates each of
 * the properties outlined in the optionList -- and confirms if they're all valid (or not)
 *
 * @param {Array} cliOptionList represents the collection of validation options to verify
 * @param {Object} cliValidationResults Represents the CLI validation results that have been processed
 * @return {Boolean} Returns true if the property collection properties have passed validation; false if not
 */
module.exports = (cliOptionList, cliValidationResults) => !cliOptionList.some(cliOption => {
    return !cliValidationResults[cliOption].validationResult;
});
