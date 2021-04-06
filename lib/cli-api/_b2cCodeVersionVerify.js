'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const common = require('../../lib/cli-api/_common');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const codeVersionAPI = require('../apis/ci/code-versions');

/**
 * @function _b2cCodeVersionVerify
 * @description Attempts to retrieve the B2C Commerce code versions configured for the specified
 * environment -- leveraging SFCC-CI's API to do the work.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 *
 * @returns {Promise}
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {
    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            codeVersionGet: {}
        },
        outputDisplay: {
            authenticate: {}
        }
    };

    // Authenticate first
    try {
        // Audit the authorization token for future rest requests
        output.apiCalls.authenticate.authToken = await b2cAuthenticate(environmentDef);
        output.outputDisplay.authenticate.authToken = output.apiCalls.authenticate.authToken;
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);
        return;
    }

    // Then activate the code version
    try {
        const getDetailResults = await codeVersionAPI.getDetail(environmentDef, output.apiCalls.authenticate.authToken);
        output.apiCalls.codeVersionGet.getDetailResults = common.createCodeVersionSummary([getDetailResults.data])[0];
        // Prepare the data to be displayed in the output
        output.outputDisplay.codeVersionGet = [
            output.apiCalls.codeVersionGet.getDetailResults.id,
            output.apiCalls.codeVersionGet.getDetailResults.active,
            output.apiCalls.codeVersionGet.getDetailResults.lastModificationTime,
            output.apiCalls.codeVersionGet.getDetailResults.compatibilityMode,
            output.apiCalls.codeVersionGet.getDetailResults.webDavUrl
        ];
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToRetrieveCodeVersion')}: ${e}`);
        return;
    }

    resolve(output);
});
