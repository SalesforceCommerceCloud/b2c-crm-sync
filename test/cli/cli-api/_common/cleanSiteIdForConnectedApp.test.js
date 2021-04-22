// noinspection JSStringConcatenationToES6Template

'use strict';

// Initialize constants
const assert = require('chai').assert;

// Initialize dependencies
const cleanSiteIdForConnectedApp = require('../../../../lib/cli-api/_common/_cleanSiteIdForConnectedApp');

describe('Cleaning the SiteId for a ConnectedApp', function () {

    // Default the root siteValue that will be used in tests
    // noinspection SpellCheckingInspection
    const siteRootValue = '_01234abcd_';
    const cleanedSiteRootValue = 'a01234abcd';

    it('removes non alpha-numeric / underscore characters from the siteId', function () {

        // Initialize local variables
        let siteId,
            output;

        // Default the siteId used to validate this test
        siteId = `   !@#$%${siteRootValue})(*   $*`;

        // Create the code-version summary
        output = cleanSiteIdForConnectedApp(siteId);

        // Validate that the non-alpha numeric characters are removed from the siteId
        assert.equal(output, cleanedSiteRootValue, '-- expected all non alpha-numeric characters to be removed');

    });

    it('replaces two underscores with a single underscore', function () {

        // Initialize local variables
        let siteId,
            output,
            validationResult;

        // Default the siteId used to validate this test
        siteId = `__${siteRootValue}`;

        // Create the code-version summary
        output = cleanSiteIdForConnectedApp(siteId);

        // Search the cleaned siteId for two underscores
        validationResult = output.indexOf('__');

        // Validate that two underscores no longer exist in the siteId
        assert.equal(validationResult, -1, '-- two underscores should not be found in the cleaned siteId');

    });

    it('removes trailing underscores from the siteId', function () {

        // Initialize local variables
        let siteId,
            output,
            lastCharacter;

        // Default the siteId used to validate this test
        siteId = `${siteRootValue}_`;

        // Create the code-version summary
        output = cleanSiteIdForConnectedApp(siteId);

        // Search the cleaned siteId for two underscores
        lastCharacter = output.substr(-1);

        // Validate that the last character in the siteId is not an underscore
        assert.notEqual(lastCharacter, '_', '-- the last character cannot be an underscore');

    });

    it('removes whitespace from the siteId', function () {

        // Initialize local variables
        let siteId,
            output,
            validationResult;

        // Default the siteId used to validate this test
        siteId = ` ${siteRootValue}   ${siteRootValue}    `;

        // Create the code-version summary
        output = cleanSiteIdForConnectedApp(siteId);

        // Search the cleaned siteId for two underscores
        validationResult = output.indexOf(' ');

        // Validate that the generated environment is returned as an object
        assert.equal(validationResult, -1, '-- whitespace should not be found in the cleaned siteId');

    });


    it('replaces non-alpha 1st characters with an alpha character', function () {

        // Initialize local variables
        let siteId,
            output,
            firstCharacter,
            validationResult;

        // Default the siteId used to validate this test
        siteId = `0${siteRootValue}`;

        // Create the code-version summary
        output = cleanSiteIdForConnectedApp(siteId);

        // Lastly, ensure the siteId begins with a letter
        firstCharacter = output.substr(0, 1);

        console.log(firstCharacter);

        // Search the cleaned siteId for two underscores
        validationResult = (/[a-zA-Z]/).test(firstCharacter);

        // Validate that the generated environment is returned as an object
        assert.isTrue(validationResult, '-- expected the first character to be a string');

    });


});
