'use strict';

/**
 * @function wasB2CProfileRegistered
 * @description Helper function to evaluate if a B2C Commerce customer profile was
 * successfully registered with a given B2C Commerce instance
 *
 * @param {Object} registrationResultsObj represents the registration results object
 * @return {Boolean} Describes if the B2C Customer storefront registration was successful
 */
module.exports = (registrationResultsObj) => {

    // Default the output property
    let output = false;

    // Was a customer found matching the search results?
    if (registrationResultsObj.status === 200 &&
        Object.prototype.hasOwnProperty.call(registrationResultsObj.data, 'customer_id')) {
        output = true;
    }

    // Return the output status
    return output;

};
