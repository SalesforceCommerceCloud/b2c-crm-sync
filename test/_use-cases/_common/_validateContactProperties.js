'use strict';

// Initialize the assertion library
const assert = require('chai').assert;

/**
 * @private
 * @function _validateContactProperties
 * @description Helper function to validate that each of the Contact properties present in a sourceContact are also
 * present in the response provided by the B2CContactProcess flow.
 *
 * @param processResults {Object} Represents the processing results returned by the service-call
 * @param sourceContact {Object} Represents the sourceContact that was fed to the serviceCall
 */
module.exports = function _validateContactProperties(processResults, sourceContact) {

    // Initialize local variables
    let processResult,
        contactProperties;

    // Shorthand a reference to the response data
    processResult = processResults.data[0];

    // Retrieve the collection of keys on a given sourceContact
    contactProperties = Object.keys(sourceContact);

    // Loop over the collection of properties and evaluate each value
    contactProperties.forEach(function (contactProperty) {

        // Evaluate that each of the properties exist -- and that their values align and match-up
        assert.isTrue(processResult.outputValues.Contact.hasOwnProperty(contactProperty), ` -- expected the Contact object to have the property ${contactProperty}`);
        assert.equal(processResult.outputValues.Contact[contactProperty], sourceContact[contactProperty], ` -- value misMatch: ${contactProperty}; expected the REST response and sourceContact object to have the same values`);

    });

};
