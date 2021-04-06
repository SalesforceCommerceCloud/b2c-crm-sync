'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Initialize constants
const config = require('config');

// Include local libraries
const fsAPI = require('../../lib/_common/fs');

// Include B2C Commerce API functions
const b2cAuthenticate = require('../apis/ci/_authenticate');
const deploymentAPI = require('../apis/ci');

/**
 * @function _b2cDeployData
 * @description This function is used to deploy the metadata to the B2C Commerce instance.
 * environment -- leveraging SFCC-CI's API to do the work.
 *
 * @param {Object} environmentDef Represents the already-validated environment details to use when performing the actions
 * @param {String} pathScope Describes the scope for the deployment folder (sfcc vs sfsc)
 * @param {String} pathElement Describes the parent sub-folder to be processed
 *
 * @returns {Promise}
 */
module.exports = (environmentDef, pathScope, pathElement) => new Promise(async (resolve, reject) => {
    // Roll-up the validation results to a single object
    const output = {
        apiCalls: {
            authenticate: {},
            upload: {},
            import: {}
        },
        outputDisplay: {
            authenticate: {}
        }
    };

    // Ensure the zip file exists
    const archiveName = fsAPI.getDeployArchiveName(environmentDef, pathElement);
    const archivePath = path.join(fsAPI.getDeployPath(pathScope, pathElement), archiveName);
    if (!fs.existsSync(archivePath)) {
        reject(`${config.get('errors.b2c.cannotFindMetadataArchive')}`);
        return;
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

    // Then upload the archive to the B2C Commerce instance
    try {
        output.apiCalls.upload = await deploymentAPI.upload(environmentDef, archivePath, output.apiCalls.authenticate.authToken);
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToUploadMetadataArchive')}: ${e}`);
        return;
    }

    // Then import the archive to the B2C Commerce instance
    try {
        output.apiCalls.import = await deploymentAPI.import(environmentDef, archiveName, output.apiCalls.authenticate.authToken);
        output.outputDisplay.import = [
            output.apiCalls.import.job_id,
            output.apiCalls.import.status,
            moment(new Date(output.apiCalls.import.end_time)).format('MM/DD/YY HH:MM:SS'),
            moment(new Date(output.apiCalls.import.end_time)).format('MM/DD/YY HH:MM:SS')
        ];
    } catch (e) {
        reject(`${config.get('errors.b2c.unableToImportMetadataArchive')}: ${e}`);
        return;
    }

    resolve(output);
});
