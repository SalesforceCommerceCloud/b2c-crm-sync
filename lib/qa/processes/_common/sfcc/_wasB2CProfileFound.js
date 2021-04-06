'use strict';

/**
 * @function _wasB2CProfileFound
 * @description Helper function to evaluate overall search results to determine
 * if a B2C Commerce Customer Profile was found
 *
 * @param {Object} searchResultObj represents the collection of search results
 * @return {Boolean} Returns a boolean record describing if a profile was found
 */
module.exports = (searchResultObj) => {

    // Default the output property
    let output = false;

    // Was a customer found matching the search results?
    if (searchResultObj.status === 200 && (searchResultObj.data.count > 0 && searchResultObj.data.hasOwnProperty('hits'))) {
        output = true;
    }

    // Return the output status
    return output;

}
