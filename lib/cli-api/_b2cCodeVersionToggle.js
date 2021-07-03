'use strict';

// Initialize constants
const config = require('config');

// Include local libraries
const common = require('../../lib/cli-api/_common');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const codeVersions = require('../apis/ci/code-versions');

/**
 * @function _codeVersionsToggle
 * @description Attempts to toggle the active B2C Commerce code versions configured for the specified
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
            toggleCodeVersion: {},
            activeCodeVersion: {}
        },
        outputDisplay: {
            authenticate: {}
        }
    };

    /**
     * @private
     * @unction _getCodeVersionList
     * @description Abstracted helper-function containing the async snippet used to repeatedly retrieve
     * code-version lists in between the activation events required by the toggle
     *
     * @param {environmentDef} environmentDef Represents the current runtime-environment definition
     * @param {String} b2cAuthToken Represents the authKey used to communicate with B2C Commerce
     * @param {String} outputKey Describes the local key used to store errorObj and request responses
     * @param {String} codeVersionInstanceKey Describes the local key used to capture the summarized code-versions
     *
     * @returns {String} The error message if an error occurred, or nothing in case of success
     */
    async function _getCodeVersionList(environmentDef, b2cAuthToken, outputKey, codeVersionInstanceKey) {
        try {
            // Attempt to retrieve the code-versions for the configured environment
            const codeVersionsResult = await codeVersions.list(environmentDef, b2cAuthToken);
            // Audit the code-version list results
            output.apiCalls[outputKey] = {
                error: undefined,
                codeVersions: codeVersionsResult
            };

            // Create the roll-up summary for the B2C Commerce code versions
            output[codeVersionInstanceKey] = common.createCodeVersionSummary(codeVersionsResult.data);
            // Prepare the data to be displayed in the output
            output.outputDisplay[codeVersionInstanceKey] = output[codeVersionInstanceKey].map(codeVersion => [
                codeVersion.id,
                codeVersion.active,
                codeVersion.lastModificationTime,
                codeVersion.compatibilityMode,
                codeVersion.webDavUrl
            ]);
        } catch (e) {
            output.apiCalls[outputKey] = {
                error: e,
                codeVersions: []
            };
        }
    }

    // Authenticate first
    try {
        // Audit the authorization token for future rest requests
        output.apiCalls.authenticate.authToken = await b2cAuthenticate(environmentDef);
        output.outputDisplay.authenticate.authToken = output.apiCalls.authenticate.authToken;
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToAuthenticate')}: ${e}`);
        return;
    }

    // Leverage the code-version list wrapper function to retrieve the code-version listing
    await _getCodeVersionList(environmentDef, output.apiCalls.authenticate.authToken, 'codeVersionsList', 'codeVersions');
    if (output.apiCalls.codeVersionsList.error) {
        reject(output.apiCalls.codeVersionsList.error);
        return;
    }

    // Identify the toggle code version that we'll leverage
    output.apiCalls.toggleCodeVersion = codeVersions.findToggle(output.codeVersions);

    // Was a toggle code-version found?
    if (output.apiCalls.toggleCodeVersion === undefined) {

        // If not, flag that no toggle was found
        output.noToggle = true;

        // Exit early
        resolve(output);

    } else {

        output.outputDisplay.toggleCodeVersion = [
            output.apiCalls.toggleCodeVersion.id,
            output.apiCalls.toggleCodeVersion.active,
            output.apiCalls.toggleCodeVersion.lastModificationTime,
            output.apiCalls.toggleCodeVersion.compatibilityMode,
            output.apiCalls.toggleCodeVersion.webDavUrl
        ];

        // Then toggle the code version
        try {
            output.apiCalls.toggleCodeVersion.toggleResult = await codeVersions.activate(environmentDef, output.apiCalls.authenticate.authToken, output.apiCalls.toggleCodeVersion.id);
        } catch (e) {
            reject(`${config.get('errors.b2c.unableToActivateCodeVersion')}: ${e}`);
            return;
        }

        // Leverage the code-version list wrapper function to retrieve the code-version listing
        await _getCodeVersionList(environmentDef, output.apiCalls.authenticate.authToken, 'codeVersionsToggleList', 'codeVersionsToggle');
        if (output.apiCalls.codeVersionsToggleList.error) {
            reject(output.apiCalls.codeVersionsToggleList.error);
            return;
        }

        // Next, identify the toggle code version that's active (to toggle back to)
        output.apiCalls.activeCodeVersion = codeVersions.findToggle(output.codeVersions, true);
        output.outputDisplay.activeCodeVersion = [
            output.apiCalls.activeCodeVersion.id,
            output.apiCalls.activeCodeVersion.active,
            output.apiCalls.activeCodeVersion.lastModificationTime,
            output.apiCalls.activeCodeVersion.compatibilityMode,
            output.apiCalls.activeCodeVersion.webDavUrl
        ];

        // Then toggle the code version
        try {
            output.apiCalls.activeCodeVersion.toggleResult = await codeVersions.activate(environmentDef, output.apiCalls.authenticate.authToken, output.apiCalls.activeCodeVersion.id);
        } catch (e) {
            reject(`${config.get('errors.b2c.unableToActivateCodeVersion')}: ${e}`);
            return;
        }

        // Leverage the code-version list wrapper function to retrieve the code-version listing
        await _getCodeVersionList(environmentDef, output.apiCalls.authenticate.authToken, 'codeVersionsActivateList', 'codeVersionsActivate');
        if (output.apiCalls.codeVersionsActivateList.error) {
            reject(output.apiCalls.codeVersionsActivateList.error);
            return;
        }

        resolve(output);

    }

});
