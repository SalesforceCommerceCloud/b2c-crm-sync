/**
 * @author Abraham David Lloyd
 * @date February 13th, 2021
 *
 * @description This trigger is used to create Platform Events that trigger an
 * update of the Contact with a details of a mapped B2C Commerce Customer Profile.
 */
trigger B2CProcessContact on Contact (before update) {

    // Initialize local variables
    List<Contact> newContacts;
    List<Contact> oldContacts;
    Contact newContact;
    Contact oldContact;
    Map<String, B2C_Instance__c> instanceMap;
    Map<String, B2C_CustomerList__c> customerListMap;
    B2CIAValidateContactInput validateContactInput;
    B2CIAValidateContactResult validateContactResult;
    List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
    List<B2C_Integration_Field_Mappings__mdt> updatedFieldMappings;
    Map<String, Object> thisB2CProfile;
    String thisB2CProfileJSON;

    try {

        // Only process and evaluate updates to Contacts when the trigger is enabled
        // Do not process this trigger if the AccountContactModel is configured for PersonAccounts
        if (Trigger.isUpdate && B2CConfigurationManager.isB2CProcessContactTriggerEnabled() == true &&
            B2CConfigurationManager.getDefaultAccountContactModel() == B2CConstant.AccountContactModel_Standard) {

            // Get the fieldMappings for the customerProfile object
            fieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing('Contact');

            // Only process the trigger if publish-friendly fieldMappings are found
            if (fieldMappings.size() > 0) {

                // Initialize the instance maps
                instanceMap = new Map<String, B2C_Instance__c>();
                customerListMap = new Map<String, B2C_CustomerList__c>();

                // Create collections representing new / old Contact records
                newContacts = Trigger.new;
                oldContacts = Trigger.old;

                // Loop over the collection of Contact updates
                for (Integer contactIndex = 0; contactIndex < newContacts.size(); contactIndex++) {

                    // Create a reference to the current new / old Contact being processed
                    newContact = newContacts.get(contactIndex);
                    oldContact = oldContacts.get(contactIndex);

                    // Has the updated by B2C Platform Event been flipped?  If so, continue
                    // Prevent a circular loop where the PE updates fire trigger updates
                    if (newContact.Updated_by_B2C_Platform_Event__c == true) {

                        // Remove the platform-event updated flag
                        newContact.Updated_by_B2C_Platform_Event__c = false;

                        // Continue processing
                        continue;

                    }

                    // Is the Contact mapped to an Account? If not, continue
                    if (newContact.AccountId == null) { continue; }

                    // Is the Contact mapped to a CustomerList and have a valid customerNo?  If not, continue
                    if (newContact.B2C_CustomerList__c == null || newContact.B2C_Customer_No__c == null) { continue; }

                    // Maintain the customerList and instance maps to minimize queries
                    instanceMap = B2CProcessContactHelper.updateInstanceMap(newContact.B2C_Instance__c, instanceMap);
                    customerListMap = B2CProcessContactHelper.updateCustomerListMap(newContact.B2C_CustomerList__c, customerListMap);

                    // Create an instance of the validateContactInput class and process validation
                    validateContactInput = B2CProcessContactHelper.getValidateContactInput(newContact,
                        instanceMap.get(newContact.B2C_Instance__c),
                        customerListMap.get(newContact.B2C_CustomerList__c));

                    // Validate the contact results and determine if integration is enabled
                    validateContactResult = B2CProcessContactHelper.getValidateContactResult(validateContactInput);

                    // Is integration disabled for this contact? If so, then continue
                    if (validateContactResult.allowIntegrationProcess == false) { continue; }

                    // Determine if this Contact been updated through one of the publish fieldMappings
                    updatedFieldMappings = B2CProcessContactHelper.getUpdatedFieldMappings(oldContact, newContact, fieldMappings);

                    // Has the Contact record been updated?
                    if (updatedFieldMappings.size() > 0) {

                        // If so, get the field-specific updates for the updated contact
                        thisB2CProfile = B2CContactManager.getPublishProfile(newContact, updatedFieldMappings);
                        thisB2CProfileJSON = JSON.serializePretty(thisB2CProfile, true);

                        // Then create the Contact Publish Platform Event and override the publish JSON
                        B2CProcessContactHelper.createPublishPlatformEvent(validateContactInput, thisB2CProfileJSON);

                    }

                }

            }

        }

    } catch (Exception e) {}

}
