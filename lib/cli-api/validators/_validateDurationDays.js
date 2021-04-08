'use strict';

// Initialize any local libraries
const validateInputValue = require('./_validateInputValue');

/**
 * @function _validateDurationDays
 * @description This function is used to validate that a ClientID is well-formed.
 *
 * @param {*} ScratchOrgDurationDaysValue Represents the duration days of the scratch org
 * @return {Object} Returns the validation result driven by constraint definitions
 */
module.exports = ScratchOrgDurationDaysValue => validateInputValue(ScratchOrgDurationDaysValue, 'ScratchOrgDurationDays');
