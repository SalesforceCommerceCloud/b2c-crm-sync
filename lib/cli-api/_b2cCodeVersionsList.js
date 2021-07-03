'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const common = require('../../lib/cli-api/_common');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const codeVersions = require('../apis/ci/code-versions');

/**
 * @typedef {Object} codeVersion
 * @description Represents a object describing a subset of the B2C Commerce code-version properties
 *
 * @property {String} id Describes the customer-facing identifier for the code version
 * @property {String} active Describes if the code-version is active in the B2C Commerce storefront
 * @property {String} rollback Describes if the rollback option is configured / available for a code version
 * @property {String} compatibilityMode Describes the compat-mode enforced for the current codeVersion
 * @property {String} webDavUrl Describes the shortened webDav access url for the code version
 * @property {String} lastModificationTime Describes the date / time the codeversion was last modified
 */

/**
 * @function _b2cCodeVersionsList
 * @description Attempts to retrieve the B2C Commerce code versions configured for the specified
 * environment -- leveraging SFCC-CI's API to do the work.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to
 * use when performing the actions
 * @returns {Promise} Returns the B2C Commerce code-version retrieval results
 */
module.exports = environmentDef => new Promise(async (resolve, reject) => {

    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            codeVersionList: {}
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

        // Retrieve the codeVersion result
        const codeVersionsResult = await codeVersions.list(
            environmentDef, output.apiCalls.authenticate.authToken);

        // Create the roll-up summary for the B2C Commerce code versions
        output.apiCalls.codeVersionList.codeVersions = common.createCodeVersionSummary(
            codeVersionsResult.data);

        // Prepare the data to be displayed in the output
        output.outputDisplay.codeVersionList = output.apiCalls.codeVersionList.codeVersions.map(codeVersion => [
            codeVersion.id,
            codeVersion.active,
            codeVersion.lastModificationTime,
            codeVersion.compatibilityMode,
            codeVersion.webDavUrl
        ]);

    } catch (e) {

        reject(`${config.get('errors.b2c.unableToRetrieveCodeVersion')}: ${e}`);
        return;

    }

    resolve(output);

});
