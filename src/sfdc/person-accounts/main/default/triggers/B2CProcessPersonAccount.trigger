/**
 * @author Abraham David Lloyd
 * @date April 11th, 2021
 *
 * @description This trigger is used to create Platform Events that trigger an
 * update of the PersonAccount with a details of a mapped B2C Commerce Customer Profile.
 */
trigger B2CProcessPersonAccount on Account (before update) {

    // Initialize local variables
    List<Account> newPersonAccounts;
    List<Account> oldPersonAccounts;
    Account newPersonAccount;
    Account oldPersonAccount;
    Contact validateContact;
    Contact publishContact;
    Map<String, B2C_Instance__c> instanceMap;
    Map<String, B2C_CustomerList__c> customerListMap;
    B2CIAValidateContactInput validateContactInput;
    B2CIAValidateContactResult validateContactResult;
    List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
    List<B2C_Integration_Field_Mappings__mdt> contactFieldMappings;
    List<B2C_Integration_Field_Mappings__mdt> updatedFieldMappings;
    List<B2C_Integration_Field_Mappings__mdt> publishFieldMappings;
    Map<String, Object> thisB2CProfile;
    String thisB2CProfileJSON;

    try {

        // Only process and evaluate updates to PersonAccounts when the trigger is enabled
        // Do not process this trigger if the AccountContactModel is configured for Accounts / Contacts
        if (Trigger.isUpdate && B2CConfigurationManager.isB2CProcessContactTriggerEnabled() == true &&
                B2CConfigurationManager.getDefaultAccountContactModel() == B2CConstant.AccountContactModel_Person) {

            // Get the fieldMappings for the customerProfile object
            contactFieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing('Contact');
            fieldMappings = B2CMetaFieldMappings.toggleAlternateObjectAttributes(contactFieldMappings);

            // Only process the trigger if publish-friendly fieldMappings are found
            if (fieldMappings.size() > 0) {

                // Initialize the instance maps
                instanceMap = new Map<String, B2C_Instance__c>();
                customerListMap = new Map<String, B2C_CustomerList__c>();

                // Create collections representing new / old personAccount records
                newPersonAccounts = Trigger.new;
                oldPersonAccounts = Trigger.old;

                // Loop over the collection of personAccount updates
                for (Integer accountIndex = 0; accountIndex < newPersonAccounts.size(); accountIndex++) {

                    // Create a reference to the current new / old PersonAccount being processed
                    newPersonAccount = newPersonAccounts.get(accountIndex);
                    oldPersonAccount = oldPersonAccounts.get(accountIndex);

                    // Has the updated by B2C Platform Event been flipped?  If so, continue
                    // Prevent a circular loop where the PE updates fire trigger updates
                    if (newPersonAccount.Updated_by_B2C_Platform_Event__pc == true) {

                        // Remove the platform-event updated flag
                        newPersonAccount.Updated_by_B2C_Platform_Event__pc = false;

                        // Continue processing
                        continue;

                    }

                    // Is the Contact mapped to a CustomerList and have a valid customerNo?  If not, continue
                    if (newPersonAccount.B2C_CustomerList__pc == null || newPersonAccount.B2C_Customer_No__pc == null) { continue; }

                    // Maintain the customerList and instance maps to minimize queries
                    instanceMap = B2CProcessContactHelper.updateInstanceMap(newPersonAccount.B2C_Instance__pc, instanceMap);
                    customerListMap = B2CProcessContactHelper.updateCustomerListMap(newPersonAccount.B2C_CustomerList__pc, customerListMap);

                    // Initialize the validateContact
                    validateContact = new Contact();

                    // Default the contact identifier
                    validateContact.Id = newPersonAccount.PersonContactId;

                    // Seed the integration control properties for the contact; this represents the
                    // minimum collection of Contact attributes required to feed the PlatformEvent
                    validateContact.B2C_Disable_Integration__c = newPersonAccount.B2C_Disable_Integration__pc;
                    validateContact.Audit_OCAPI_API_Response__c = newPersonAccount.Audit_OCAPI_API_Response__pc;
                    validateContact.B2C_Customer_No__c = newPersonAccount.B2C_Customer_No__pc;

                    // Create an instance of the validateContactInput class and process validation
                    validateContactInput = B2CProcessContactHelper.getValidateContactInput(validateContact,
                        instanceMap.get(newPersonAccount.B2C_Instance__pc),
                        customerListMap.get(newPersonAccount.B2C_CustomerList__pc));

                    // Validate the contact results and determine if integration is enabled
                    validateContactResult = B2CProcessContactHelper.getValidateContactResult(validateContactInput);

                    // Is integration disabled for this contact? If so, then continue
                    if (validateContactResult.allowIntegrationProcess == false) { continue; }

                    // Determine if this Contact been updated through one of the publish fieldMappings
                    updatedFieldMappings = B2CProcessContactHelper.getUpdatedFieldMappings(oldPersonAccount, newPersonAccount, fieldMappings);

                    // Has the Contact record been updated?
                    if (updatedFieldMappings.size() > 0) {

                        // Generate a contact-representation of the Account that only includes publishable fields
                        publishContact = B2CAccountManager.getPublishContact(newPersonAccount, updatedFieldMappings);

                        // Toggle the fieldMappings back to the Contact so we can use them for the publishEvent
                        publishFieldMappings = B2CMetaFieldMappings.toggleAlternateObjectAttributes(updatedFieldMappings);

                        // If so, get the field-specific updates for the updated contact
                        thisB2CProfile = B2CContactManager.getPublishProfile(publishContact, publishFieldMappings);

                        thisB2CProfileJSON = JSON.serializePretty(thisB2CProfile, true);

                        // Then create the Contact Publish Platform Event and override the publish JSON
                        B2CProcessContactHelper.createPublishPlatformEvent(validateContactInput, thisB2CProfileJSON);

                    }

                }

            }

        }

    } catch (Exception e) {}

}
