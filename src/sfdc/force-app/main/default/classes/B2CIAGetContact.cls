/**
 * @author Abraham David Lloyd
 * @date April 12th, 2021
 *
 * @description This is a wrapper-class to enable the retrieval of a specific
 * B2C Contact that only contains minimum identifiers and mapped fields.
*/
global with sharing class B2CIAGetContact extends B2CBaseAttributeAssignment {

    /**
     * @see B2CIAGetContactResult
     * @description Invokable action to retrieve a B2C Contact
     *
     * @param requestArguments {List<B2CIAGetContactInput>} Represents the request arguments to process
     * @returns {List<B2CIAGetContactResult>} Returns the B2C Contact resolved using request arguments
     */
    @InvocableMethod(Label='B2C: Get Contact' Description='Attempts to retrieve details for a B2C Contact containing minimum identifiers and fieldMappings')
    global static List<B2CIAGetContactResult> getContact(List<B2CIAGetContactInput> requestArguments) {

        // Initialize local variables
        Contact resolvedContact;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        List<B2CIAGetContactResult> output;
        B2CIAGetContactResult getContactResult;

        // Initialize the output variable
        output = new List<B2CIAGetContactResult>();

        // Retrieve the fieldMappings to leverage based on the Account / Contact Model being employed
        fieldMappings = B2CMetaFieldMappings.getFieldMappingsForRetrieval('Contact');

        // Loop over the collection of site details
        for (B2CIAGetContactInput requestInput: requestArguments) {

            // Initialize the contactResult
            getContactResult = new B2CIAGetContactResult();

            // Default the contactResult properties
            getContactResult.crmContactId = requestInput.crmContactId;
            getContactResult.crmContactCount = 0;

            // Attempt to retrieve the resolved Contact using the specified fieldMappings
            resolvedContact = B2CContactManager.getContactById(requestInput.crmContactId, false, fieldMappings);

            // Was a contact retrieved?
            if (resolvedContact != null) {

                // Were the accountId / personAccount properties flagged for removal?
                if (requestInput.omitAccountId == true) {

                    // If so, then remove the personAccount properties from the Contact
                    resolvedContact = (Contact) removePersonAccountProperties(resolvedContact);

                }

                // Map the resolvedContact and contactCount
                getContactResult.crmContact = resolvedContact;
                getContactResult.crmContactCount = 1;

            }

            // Add the contactResult to the output collection
            output.add(getContactResult);

        }

        // Return the output collection
        return output;

    }

}
