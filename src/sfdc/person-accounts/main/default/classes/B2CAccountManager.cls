/**
 * @author Abraham David Lloyd
 * @date April 11th, 2021
 *
 * @description This class is used to interact with PersonAccounts and convert them
 * to Contact representations we can use to leverage common b2c-crm-sync business logic.
 */
public with sharing class B2CAccountManager extends B2CBaseMeta {

    /**
     * @description Helper function that takes the identified collection of modified fields for an
     * Account (scoped by fieldMappings), and creates a Contact reflecting these field-values.
     *
     * @param personAccountToProcess {Account} Represents the PersonAccount being processed
     * @param updatedFieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the fieldMappings identifying updated fields
     * @return {Contact} Returns a Contact containing only the updated fields that were identified
     */
    public static Contact getPublishContact(Account personAccountToProcess, List<B2C_Integration_Field_Mappings__mdt> updatedFieldMappings) {

        // Initialize local variables
        Contact output;

        // Create the new contact instance
        output = new Contact();

        // Default the Id for the current Contact
        output.Id = personAccountToProcess.PersonContactId;
        output.AccountId = personAccountToProcess.Id;

        // Include the integration control fields
        output.B2C_Disable_Integration__c = personAccountToProcess.B2C_Disable_Integration__pc;
        output.Audit_OCAPI_API_Response__c = personAccountToProcess.Audit_OCAPI_API_Response__pc;

        // Loop over the field-mappings and attribute the updated / changed values
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping : updatedFieldMappings) {

            // Seed the contact with each modified property of the Account
            output.put(
                thisFieldMapping.Service_Cloud_Attribute_Alt__c,
                personAccountToProcess.get(thisFieldMapping.Service_Cloud_Attribute__c)
            );

        }

        // Return the publish Contact-representation
        return output;

    }

}
