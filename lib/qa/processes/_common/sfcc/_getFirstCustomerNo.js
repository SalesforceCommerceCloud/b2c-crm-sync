'use strict';

/**
 * @type {Array} hitsCollection Represents the collection of searchResults
 * @property {Object} data Represents the parent object for each searchResult record
 * @property {String} data.customer_no Represents the customerNo associated to each result
 */

/**
 * @function _getFirstCustomerNo
 * @description Helper function to retrieve the first customerNo found in
 * a query results set (simplifies our use-case execution)
 *
 * @param {Array} hitsCollection represents the collection of search results
 * @return {String} Returns the customerNo found in the first searchResult
 */
module.exports = (hitsCollection) => {

    // Default the output property
    let output;

    // Create a reference to the first customerNo found in the collection
    output = hitsCollection[0].data.customer_no;

    // Return the output status
    return output;

}
