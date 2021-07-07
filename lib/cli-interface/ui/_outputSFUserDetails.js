'use strict';

/**
 * @function outputSFUserDetails
 * @description Output's the user-detail definition via the CLI
 *
 * @param {Object} resultObj Represents the resultObj from the userDetails CLI command
 */
module.exports = resultObj => {

    // Initialize local variables
    let hostName,
        loginUrl;

    // Default the urls
    hostName = resultObj.result.instanceUrl;
    loginUrl = resultObj.result.loginUrl;

    // Format the urls
    hostName = hostName.replace('https:', '');
    hostName = hostName.replace(/\//g, '');
    loginUrl = loginUrl.replace('https:', '');
    loginUrl = loginUrl.replace(/\//g, '');

    // Default the password if one hasn't been provided yet
    if (!resultObj.result.hasOwnProperty('password')) {
        resultObj.result.password = '';
    }

    // Output the configuration details
    console.log(`
 -- copy these details to your .env file prior to building your b2c environment
 -- remember to reset your securityToken via your scratchOrg user settings 

######################################################################
## Salesforce Platform Configuration Properties
######################################################################
SF_HOSTNAME=${hostName}
SF_LOGINURL=${loginUrl}
SF_USERNAME=${resultObj.result.username}
SF_PASSWORD=${resultObj.result.password}
    `);

};
