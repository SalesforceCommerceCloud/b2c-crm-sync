'use strict';

// Initialize required modules
const sfdx = require('sfdx-node/parallel');

/**
 * @function _sfB2CInstanceUpdate
 * @description Attempts to update the previously created b2c instance with the newly created named credential
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @returns {Promise}
 */
module.exports = async environmentDef => {
    const b2cInstance = await sfdx.data.recordGet({
        sobjecttype: 'B2C_Instance__c',
        where: `Name='${environmentDef.b2cInstanceName}'`
    });
    if (!b2cInstance) {
        return;
    }

    return sfdx.data.recordUpdate({
        sobjecttype: 'B2C_Instance__c',
        sobjectid: b2cInstance.Id,
        values: `Named_Credential_Developer_Name__c='${environmentDef.b2cInstanceName}_B2C_AMCredentials'`
    });
};
