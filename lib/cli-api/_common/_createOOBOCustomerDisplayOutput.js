'use strict';

/**
 * @function _createOOBOCustomerDisplayOutput
 * @description Helper function used to create the output display for the OOBO Customer
 *
 * @param {Object} customerProfile Represents the customer profile that will be converted to the output display
 * @return {Array} Returns an array containing the output representation
 */
module.exports = (customerProfile) => {

    // Initialize local variables
    let output;

    // Default the account and contactId values -- in the event that they are not defined; we want to
    // highlight if these values weren't generated as part of the visual output to the build user
    if (!customerProfile.hasOwnProperty('c_b2ccrm_accountId') || customerProfile.c_b2ccrm_accountId === undefined) {
        customerProfile.c_b2ccrm_accountId = '---';
    }

    if (!customerProfile.hasOwnProperty('c_b2ccrm_contactId') || customerProfile.c_b2ccrm_contactId === undefined) {
        customerProfile.c_b2ccrm_contactId = '---';
    }

    // Default the password if it's not automatically included in the profile details
    if (!customerProfile.hasOwnProperty('password')) { customerProfile.password = '---'; }

    // Create the output display for the customerGet (display the details of the OOBO customer)
    output = [
        ['customerList', customerProfile.customer_list],
        ['customerNo', customerProfile.customer_no],
        ['customerId', customerProfile.customer_id],
        ['status', 'OOBO Customer profile verified for this customerList / customerNo combination'],
        ['creation date', customerProfile.creation_date],
        ['modified date', customerProfile.last_modified],
        ['login', customerProfile.credentials.login],
        ['password', customerProfile.password],
        ['first name', customerProfile.first_name],
        ['last name', customerProfile.last_name],
        ['email', customerProfile.email],
        ['accountId', customerProfile.c_b2ccrm_accountId],
        ['contactId', customerProfile.c_b2ccrm_contactId]
    ];

    // Return the customerDisplay
    return output;

};
