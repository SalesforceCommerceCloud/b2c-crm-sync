'use strict';

// Initialize constants
const nock = require('nock');
const config = require('config');

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize dependencies
const b2cAuthenticate = require('../../../../lib/apis/ci/_authenticate');

describe('Authentication via SFCC-CI', function () {
    it('succeeds when valid credentials are provided', function (done) {
        // Initialize local variables
        let nockScope,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Define the nock interceptor for the authentication request
        // noinspection SpellCheckingInspection
        nockScope = nock('https://account.demandware.com')
            .post('/dw/oauth2/access_token')
            .reply(200, {
                access_token: 'eyJ0eXAiOiJKV1QiLCJraWQiOiJEMWhPUDdEODN4TjBqZWlqaTI3WWFvZFRjL0E9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwYzdlYjgwOC1hNDFiLTRjZjMtYTMxZS01OTNiZjgyZTQ0MmEiLCJjdHMiOiJPQVVUSDJfU1RBVEVMRVNTX0dSQU5UIiwiYXVkaXRUcmFja2luZ0lkIjoiNzZjNDAxMTctMDNlNi00NDExLWE3Y2ItOTU5NzdkZjM4NDBhLTE1MjIyNDM1MiIsImlzcyI6Imh0dHBzOi8vYWNjb3VudC5kZW1hbmR3YXJlLmNvbTo0NDMvZHdzc28vb2F1dGgyIiwidG9rZW5OYW1lIjoiYWNjZXNzX3Rva2VuIiwidG9rZW5fdHlwZSI6IkJlYXJlciIsImF1dGhHcmFudElkIjoieDZCQno4cndNcEVqb3pSeWVIM3dJcldpOTlRIiwiYXVkIjoiMGM3ZWI4MDgtYTQxYi00Y2YzLWEzMWUtNTkzYmY4MmU0NDJhIiwibmJmIjoxNjA4OTQzOTI2LCJncmFudF90eXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwic2NvcGUiOlsibWFpbCIsInRlbmFudEZpbHRlciIsInByb2ZpbGUiLCJyb2xlcyJdLCJhdXRoX3RpbWUiOjE2MDg5NDM5MjYsInJlYWxtIjoiLyIsImV4cCI6MTYwODk0NTcyNiwiaWF0IjoxNjA4OTQzOTI2LCJleHBpcmVzX2luIjoxODAwLCJqdGkiOiIwZ1pFOFpmNXRQcjlfWWZIeURKcXBCQUQ3dEkiLCJjbGllbnRfaWQiOiIwYzdlYjgwOC1hNDFiLTRjZjMtYTMxZS01OTNiZjgyZTQ0MmEiLCJ0ZW5hbnRGaWx0ZXIiOiJTQUxFU0ZPUkNFX0NPTU1FUkNFX0FQSTp6enBtX3NieCIsInJvbGVzIjpbIlNBTEVTRk9SQ0VfQ09NTUVSQ0VfQVBJIiwiQ09NTUVSQ0VDTE9VRF9BUFAiLCJTQU5EQk9YX0FQSV9DTElFTlQiXX0.QAPFg2huJhqWfj8GDvvhQzOWHzU12QGzSZhEPL91jZrqS9rXjvecZ98w4LnYS94zhoFHAxS-95-hZNUBfspLgbZc3pyNUMEoKzlUDk3i40aJcn4wjgisBfydUyp5Zom38otmJphfZJvzydFexZTLnuPRZYhnsVGHQTZHzpVqhRpmLnhhF-CQzpd0UwuTVhvEP4ECrLmoltOethQUCdeK5RdJtNfiAEaIdLgIHX7g-C4gqdCz5TQ3KsZkddIuofBVAl_LjClspW3Hcp-GjJ8kb_7QtBygQ5knJyaQBqP4PIFDgYq2hbzo-wY00AT11C6UD_t0VRpUvVkIySyJZVljBQ',
                scope: 'mail tenantFilter profile roles',
                token_type: 'Bearer',
                expires_in: 1799
            });

        // Attempt to authenticate the mock request and evaluate the result
        b2cAuthenticate(environmentDef)
            .then(accessToken => assert.isTrue(accessToken.length > 0, 'expected a valid accessToken'))
            .catch(e => assert.isNull(e, 'did not expect an error to be thrown'))
            .finally(() => {
                // Evaluate if the scope is defined -- and if so, end it
                if (nockScope !== undefined) {
                    nockScope.isDone();
                }

                // Close-out the test
                done();
            });
    });

    it('fails when invalid credentials are provided', function (done) {
        // Initialize local variables
        let nockScope,
            environmentDef;

        // Retrieve the environment definition we'll use for this test
        environmentDef = config.util.toObject(config.get('unitTests.opts.default'));

        // Define the nock interceptor for the authentication request
        // noinspection SpellCheckingInspection
        nockScope = nock('https://account.demandware.com')
            .post('/dw/oauth2/access_token')
            .reply(400, {
                error_description: 'Client ID in request does not match authenticated client',
                error: 'invalid_client'
            });

        // Attempt to authenticate the mock request and evaluate the result
        b2cAuthenticate(environmentDef)
            .then(accessToken => assert.isTrue(accessToken === undefined, 'expected a non-valid accessToken'))
            .catch(e => assert.isNotNull(e, 'expected the error object to include exception details'))
            .finally(() => {
                // Evaluate if the scope is defined -- and if so, end it
                if (nockScope !== undefined) {
                    nockScope.isDone();
                }

                // Close-out the test
                done();
            });
    });
});
