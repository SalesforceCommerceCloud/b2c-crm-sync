'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfB2CInstanceGet
 * @description Attempts to retrieve a B2C Instance record
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise}
 */
module.exports = (environmentDef) => sfdx.data.recordGet({
    sobjecttype: 'B2C_Instance__c',
    where: `Name='${environmentDef.b2cInstanceName}'`
});

