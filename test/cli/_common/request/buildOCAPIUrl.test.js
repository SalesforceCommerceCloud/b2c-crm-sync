'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

// Initialize dependencies
const buildOCAPIUrl = require('../../../../lib/_common/request/_buildOCAPIUrl');

describe('Building OCAPI Urls', function () {

    it('successfully creates the getSite Shop Url', function () {

        // Initialize local variables
        let urlResult,
            siteId,
            apiVersion,
            expectedUrl;

        // Default the site / api-version to use
        siteId = 'RefArch';
        apiVersion = 'v21_03';

        // Default the expected url
        expectedUrl = `/s/${siteId}/dw/shop/${apiVersion}/site`;

        // Create the OCAPI url using the helper function
        urlResult = buildOCAPIUrl('shop', apiVersion, '/site', false, siteId);

        // Validate that the generated url matches the expected result
        assert.equal(expectedUrl, urlResult, 'failed to validate the getSite Shop API Url');

    });

    it('successfully creates the getSite Data Url', function () {

        // Initialize local variables
        let urlResult,
            siteId,
            apiVersion,
            expectedUrl;

        // Default the site / api-version to use
        siteId = 'RefArch';
        apiVersion = 'v21_03';

        // Default the expected url
        expectedUrl = `/s/-/dw/data/${apiVersion}/sites`;

        // Create the OCAPI url using the helper function
        urlResult = buildOCAPIUrl('data', apiVersion, '/sites', true, siteId);

        // Validate that the generated url matches the expected result
        assert.equal(expectedUrl, urlResult, 'failed to validate the getSite Shop API Url');

    });

});
