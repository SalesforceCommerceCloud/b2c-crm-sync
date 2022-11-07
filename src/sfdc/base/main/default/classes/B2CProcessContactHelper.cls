/**
 * @author Abraham David Lloyd
 * @date February 14th, 2021
 *
 * @description Helper class supporting the B2C ProcessContact trigger.
*/
public with sharing class B2CProcessContactHelper extends B2CBaseAttributeAssignment {

    /**
     * @description Helper method that abstracts the Contact trigger logic used by b2c-crm-sync.  This
     * method compares the Contact collections exposed by the trigger -- and evaluates if we need to
     * publish updates back to B2C Commerce.
     *
     * @param triggerNew {List<Contact>} Represents the collection of new Contact records to process
     * @param triggerOld {List<Contact>} Represents the collection of old Contact records to process
     */
    public static void processTrigger(List<Contact> triggerNew, List<Contact> triggerOld) {

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
        List<B2C_Commerce_ProcessCustomerDetails__e> peCollection;

        // Get the fieldMappings for the customerProfile object
        fieldMappings = B2CMetaFieldMappings.getFieldMappingsForPublishing('Contact');

        // Only process the trigger if publish-friendly fieldMappings are found
        if (fieldMappings.size() > 0) {

            // Initialize the platformEvent collection
            peCollection = new List<B2C_Commerce_ProcessCustomerDetails__e>();

            // Initialize the instance maps
            instanceMap = new Map<String, B2C_Instance__c>();
            customerListMap = new Map<String, B2C_CustomerList__c>();

            // Create collections representing new / old Contact records
            newContacts = triggerNew;
            oldContacts = triggerOld;

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
                    peCollection.add(B2CProcessContactHelper.createPublishPlatformEvent(validateContactInput, thisB2CProfileJSON));

                }

            }

            // Publish the PE Collection if it contains at least one (1) record
            if (peCollection.size() > 0) { EventBus.publish(peCollection); }

        }

    }

    /**
     * @description Helper function to maintain a map of B2C CustomerLists based on the
     * Contact records being processed.  This avoids the need to consistently query for B2C CustomerLists
     * as Contact records are processed within the trigger.
     *
     * @param b2cCustomerListId {String} Represents the customerList being evaluated
     * @param customerListMap {Map<String, B2C_CustomerList__c>} Represents the map of B2C CustomerList being maintained
     * @return {Map<String, B2C_CustomerList__c>} Returns an updated instance of B2C CustomerLists
     */
    public static Map<String, B2C_CustomerList__c> updateCustomerListMap(
        String b2cCustomerListId, Map<String, B2C_CustomerList__c> customerListMap
    ) {

        // Initialize local variables
        B2C_CustomerList__c relatedCustomerList;

        // If the instanceMap already contains the customerList's parent instance -- continue
        if (customerListMap.containsKey(b2cCustomerListId)) {
            return customerListMap;
        }

        // Retrieve the related customerList
        relatedCustomerList = B2CCustomerListManager.getCustomerListById(b2cCustomerListId, true, true);

        // Add the customerList to the instance map
        customerListMap.put(b2cCustomerListId, relatedCustomerList);

        // Return the customerListMap
        return customerListMap;

    }

    /**
     * @description Helper function to maintain a map of B2C Instances based on the
     * Contact records being processed.  This avoids the need to consistently query for B2C Instances
     * as Contact records are processed within the trigger.
     *
     * @param b2cInstanceName {String} Represents the name of the B2C Instance being evaluated
     * @param instanceMap {Map<String, B2C_Instance__c>} Represents the map of B2C Instances being maintained
     * @return {Map<String, B2C_Instance__c>} Returns an updated instance of B2C Instances
     */
    public static Map<String, B2C_Instance__c> updateInstanceMap(
        String b2cInstanceName, Map<String, B2C_Instance__c> instanceMap
    ) {

        // Initialize local variables
        B2C_Instance__c relatedInstance;

        // If the instanceMap already contains the customerList's parent instance -- continue
        if (instanceMap.containsKey(b2cInstanceName)) {
            return instanceMap;
        }

        if (
            // Validate that we have permissions to access this data-object
            B2C_Instance__c.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.B2C_Instance__c.fields.Id.isAccessible() &&
            Schema.SObjectType.B2C_Instance__c.fields.Name.isAccessible() &&
            Schema.SObjectType.B2C_Instance__c.fields.Is_Active__c.isAccessible()
        ) {

            // Retrieve the instance
            relatedInstance = [
                SELECT  Id,
                        Name,
                        Is_Active__c
                FROM    B2C_Instance__c
                WHERE   Name = :b2cInstanceName
                LIMIT   1
            ];

            // Add the instance to the map
            instanceMap.put(relatedInstance.Name, relatedInstance);

        }

        // Return the instanceMap
        return instanceMap;

    }

    /**
     * @description Helper function to create an instance of the B2CIAValidateContactInput class.  This
     * class simplifies the representation of tiered configuration settings for the B2C CRM Sync application.
     *
     * @param contactRecord {Contact} Represents the Contact record being processed
     * @param b2cInstance {B2C_Instance__c} Represents the active B2C Instance
     * @param b2cCustomerList {B2C_CustomerList__c} Represents the active B2C CustomerList
     * @return {B2CIAValidateContactInput} Returns an instance of the B2CIAValidateContactInput class
     */
    public static B2CIAValidateContactInput getValidateContactInput(
        Contact contactRecord, B2C_Instance__c b2cInstance, B2C_CustomerList__c b2cCustomerList
    ) {

        // Initialize local variables
        B2CIAValidateContactInput output;

        // Create an instance of the validateContactInput class
        output = new B2CIAValidateContactInput();

        // Seed the default properties of the class
        output.contact = contactRecord;
        output.b2cInstance = b2cInstance;
        output.customerList = b2cCustomerList;
        output.processMode = B2CConstant.CONTACT_INTEGRATION_PROCESSMODE_PUBLISH;

        // Return the output
        return output;

    }

    /**
     * @description Helper function to create an instance of the B2CIAValidateContactResult class.  This
     * class simplifies the representation of tiered configuration settings for the B2C CRM Sync application.
     *
     * @param validateContactInput {B2CIAValidateContactInput} Represents the Contact record being processed
     * @return {B2CIAValidateContactResult} Returns an instance of the B2CIAValidateContactResult class
     */
    public static B2CIAValidateContactResult getValidateContactResult(B2CIAValidateContactInput validateContactInput) {

        // Initialize local variables
        B2CIAValidateContactResult output;

        // Create an instance of the B2CIAValidateContactResult class
        output = new B2CIAValidateContactResult();

        // Set the integration options and calculate configuration settings
        output.setIntegrationOptions(validateContactInput);

        // Return the output
        return output;

    }

    /**
     * @description Helper function to create a B2C Commerce Contact Publish Platform Event.  The PE
     * triggers a Flow that is responsible for collecting and publishing B2C Commerce Customer Profile
     * updates via the OCAPI Data REST API.  This version includes the b2cProfileJSON to use in the update.
     *
     * @param validateContactInput {B2CIAValidateContactInput} Represents the source records for the Platform Event
     * @param b2cProfileJSON {String} Represents the B2C Profile JSON to use for the publish event
     * @return {Database.SaveResult} Returns the processing / saveResults for the Platform Event created
     */
    public static B2C_Commerce_ProcessCustomerDetails__e createPublishPlatformEvent(
        B2CIAValidateContactInput validateContactInput, String b2cProfileJSON
    ) {

        // Initialize local variables
        B2C_Commerce_ProcessCustomerDetails__e thisPE = new B2C_Commerce_ProcessCustomerDetails__e();

        // Seed the platform event with core properties from the contactInput class
        thisPE.Api_Url__c = validateContactInput.customerList.Base_API_Url__c;
        thisPE.Audit_API_Response__c = validateContactInput.contact.Audit_OCAPI_API_Response__c;
        thisPE.B2C_Customer_No__c = validateContactInput.contact.B2C_Customer_No__c;
        thisPE.B2C_CustomerList_ID__c = validateContactInput.customerList.Name;
        thisPE.CRM_Contact_ID__c = validateContactInput.contact.Id;
        thisPE.CRM_CustomerList_ID__c = validateContactInput.customerList.Id;
        thisPE.Named_Credential__c = validateContactInput.customerList.Named_Credential_Developer_Name__c;
        thisPE.OCAPI_Version_Number__c = validateContactInput.customerList.OCAPI_Version_No__c;
        thisPE.Process_Mode__c = validateContactInput.processMode;
        thisPE.B2C_Profile_Publish_JSON__c = b2cProfileJSON;

        // Return the created platformEvent
        return thisPE;

    }

}
