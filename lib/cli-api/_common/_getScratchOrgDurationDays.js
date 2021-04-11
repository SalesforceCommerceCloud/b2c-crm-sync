'use strict';

// Initialize constants
const config = require('config');

// Initialize local libraries
const validators = require('./../validators');

// Export the function
module.exports = scratchOrgDurationDays => validators.validateDurationDays(scratchOrgDurationDays).validationResult === true ? scratchOrgDurationDays : config.get('sfScratchOrg.durationDays');
