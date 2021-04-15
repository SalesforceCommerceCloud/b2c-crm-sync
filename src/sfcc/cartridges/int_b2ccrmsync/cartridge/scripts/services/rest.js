'use strict';

/**
 * @module services/rest
 */

/**
 * @type {dw/system/Logger}
 */
var LOGGER = require('dw/system/Logger').getLogger('int_b2ccrmsync', 'rest');

/**
 * Inserts auth token into request header
 *
 * @param {dw.svc.HTTPService} svc
 * @param {String} endpoint
 * @param {Boolean} bypassCache If true, then the authentication token will be retrieved from the Salesforce Core Platform, not from the cache
 *
 * @throws {Error} Throws error when no valid auth token is available (i.e.- service error, service down)
 */
function setAuthHeader(svc, endpoint, bypassCache) {
    /**
     * @type {module:models/authToken~AuthToken}
     */
    var token = require('../models/authToken').getValidToken(bypassCache);
    svc.setAuthentication('NONE');
    svc.addHeader('Authorization', require('dw/util/StringUtils').format('{0} {1}', token.token_type, token.access_token));
    svc.setURL(require('dw/util/StringUtils').format('{0}/{1}', token.instance_url, endpoint));
}

/**
 * Returns the service callback for the create and update actions against the REST API
 *
 * @param {String} model The model to apply to the REST API call
 * @param {String} operation The operation to perform against the REST API
 * @param {Boolean} bypassCache If true, then the authentication token will be retrieved from the Salesforce Core Platform, not from the cache
 */
function serviceCallback(model, operation, bypassCache) {
    return {
        createRequest: function (svc, body) {
            setAuthHeader(svc, require('../b2ccrmsync.config').endpoints[model][operation], bypassCache);
            svc.addHeader('Content-Type', 'application/json');
            return body;
        },
        parseResponse: function parseResponse(svc, client) {
            return require('../util/helpers').expandJSON(client.text, client.text);
        },
        mockFull: function () {
            return require(require('dw/util/StringUtils').format('./mocks/{0}.{1}', model, operation));
        },
        getRequestLogMessage: function (request) {
            LOGGER.debug(JSON.stringify(request));
        },
        getResponseLogMessage: function (response) {
            LOGGER.debug(JSON.stringify(response.getText()));
        }
    };
}

/**
 * Returns the service callback for the given {model} and {state}
 *
 * @param {String} model The model to apply to the REST API call
 * @param {String} operation The operation to perform against the REST API
 * @param {Boolean} bypassCache If true, then the authentication token will be retrieved from the Salesforce Core Platform, not from the cache
 *
 * @return {dw/svc/ServiceCallback} The service callback to use while initializing the service
 */
function getServiceCallback(model, operation, bypassCache) {
    var endpoints = require('../b2ccrmsync.config').endpoints;
    if (!endpoints[model] || !endpoints[model][operation]) {
        throw new Error(require('dw/util/StringUtils').format('Unknown endpoint for the given model "{0}" and operation "{1}"', model, operation));
    }

    return serviceCallback(model, operation, bypassCache);
}

module.exports.getServiceCallback = getServiceCallback;
