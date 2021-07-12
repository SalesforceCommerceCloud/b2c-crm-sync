'use strict';

// Initialize constants
const config = require('config');
const sfdx = require('sfdx-node/parallel');

/**
 * @private
 * @function _geScratchOrgProfile
 * @description Helper function to generate the profile-instance
 *
 * @param {String} profileName Represents the profile name to leverage
 * @return {String} Returns the profile path-name for the scratchOrg being created
 */
const geScratchOrgProfile = profileName =>
    config.get('sfScratchOrg.profilePath').toString().replace('{{profileName}}', profileName);

/**
 * @function _sfScratchOrgCreate
 * @description Attempts to create a SFDX scratch org
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise} Returns the result of the scratchOrg creation request
 */
module.exports = environmentDef => sfdx.force.org.create({
    setalias: environmentDef.sfScratchOrgAlias,
    setdefaultusername: environmentDef.sfScratchOrgSetDefault,
    durationdays: environmentDef.sfScratchOrgDurationDays,
    definitionfile: geScratchOrgProfile(environmentDef.sfScratchOrgProfile),
    _rejectOnError: true
}).then(result => {
    return {
        outputDisplay: {
            orgId: result.orgId,
            username: result.username
        },
        result
    };
});
