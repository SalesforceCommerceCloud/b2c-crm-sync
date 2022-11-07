/**
 * @author Abraham David Lloyd
 * @date February 8th, 2021
 *
 * @description This is a helper class that takes the REST API Response from B2C Commerce
 * and moves forward with parsing, processing, and writing updates to the corresponding customerProfile.
*/
public with sharing class B2CIAProcessCustomerProfile extends B2CBaseAttributeAssignment {

    /**
     * @description This method is used to process the customerProfile results retrieved from B2C Commerce
     * and update the Salesforce Account / Contact pair representing the customer.
     *
     * @param customerProfileResults {List<B2CIAGetCustomerProfileResult>} Represents the profileResults retrieved
     * from B2C Commerce that will drive the customerProfile updates
     */
    @InvocableMethod(Label='B2C: Update Customer Profile Definitions' Description='Attempts to update a Contact with the latest REST API results from B2C Commerce')
    public static void updateCustomerProfiles(List<B2CIAGetCustomerProfileResult> customerProfileResults) {

        // Initialize local variables
        JSONParse customerProfileJSON;
        List<SObject> customerProfiles;
        SObject thisCustomerProfile;
        SObject originalCustomerProfile;
        List<B2C_Integration_Field_Mappings__mdt> fieldMappings;
        Boolean hasSObjectBeenUpdated;
        Integer totalContactUpdates;
        String accountContactModel;

        // Start by retrieving the default account / contactModel
        accountContactModel = B2CConfigurationManager.getDefaultAccountContactModel();

        // Initialize the customerProfile collection
        customerProfiles = new List<SObject>();

        // Retrieve the fieldMappings to leverage based on the Account / Contact Model being employed
        fieldMappings = B2CMetaFieldMappings.getFieldMappingsForRetrieval('Contact');

        // Iterate over the collection of customerProfile results
        for (B2CIAGetCustomerProfileResult thisCustomerProfileResult : customerProfileResults) {

            // Check for any errors -- if an error was caught then skip this result
            if (thisCustomerProfileResult.isError == true) { continue; }

            // Default the tracking flag
            hasSObjectBeenUpdated = false;

            // Deserialize the REST API response into a generic and typed object
            customerProfileJSON = new JSONParse(thisCustomerProfileResult.responseBody);

            // Retrieve the current customerProfile using the specified crmId
            thisCustomerProfile = B2CContactManager.getContactById(thisCustomerProfileResult.crmContactId, true, fieldMappings);

            // Are we currently using the personAccount accountContact model?
            if (accountContactModel == B2CConstant.ACCOUNTCONTACTMODEL_PERSON) {

                // Remove the AccountID as we can't update it when the person customerModel is employed
                thisCustomerProfile = B2CBaseAttributeAssignment.removePersonAccountProperties(thisCustomerProfile);

            }

            // Create a copy of the cloned customerProfile -- so that we can compare specific values
            originalCustomerProfile = thisCustomerProfile.clone(true, true, true, true);

            // Update the key properties of the current object
            thisCustomerProfile = applyMappedFieldValues(thisCustomerProfile, customerProfileJSON, fieldMappings);

            // Evaluate the updates made and determine if the object has been updated
            hasSObjectBeenUpdated = hasSObjectBeenUpdated(originalCustomerProfile, thisCustomerProfile, fieldMappings);

            // Has the object been updated?
            if (hasSObjectBeenUpdated == true) {

                // Audit that the PlatformEvent applied updates and record the date
                thisCustomerProfile.put('Last_Platform_Event_Processed_Date__c', System.Datetime.now());
                thisCustomerProfile.put('Last_B2C_Commerce_Update_Processed__c', System.Datetime.now());
                thisCustomerProfile.put('Last_Platform_Event_Applied_Updates__c', true);

                // Increment the count of updates applied to the specified contact
                totalContactUpdates = thisCustomerProfile.get('Total_Updates_From_B2C_Commerce__c') == null ? 1 : Integer.valueOf(thisCustomerProfile.get('Total_Updates_From_B2C_Commerce__c')) + 1;

                // Increase the total updates and flag that this record was updated via a B2C Platform Event
                thisCustomerProfile.put('Total_Updates_From_B2C_Commerce__c', totalContactUpdates);
                thisCustomerProfile.put('Updated_by_B2C_Platform_Event__c', true);

                // Append the customerProfile to the processing collection
                customerProfiles.add(thisCustomerProfile);

            } else {

                // Audit that the PlatformEvent did not apply updates
                originalCustomerProfile.put('Last_Platform_Event_Processed_Date__c', System.Datetime.now());
                originalCustomerProfile.put('Last_Platform_Event_Applied_Updates__c', false);

                // Append the customerProfile to the processing collection
                customerProfiles.add(originalCustomerProfile);

            }

        }

        // Was at least one customerProfile record processed?
        if (Contact.SObjectType.getDescribe().isUpdateable() &&
            Contact.SObjectType.getDescribe().isCreateable() &&
            Contact.SObjectType.getDescribe().isAccessible() &&
            Schema.SObjectType.Contact.fields.LastName.isUpdateable() &&
            Schema.SObjectType.Contact.fields.LastName.isCreateable() &&
            customerProfiles.size() > 0) {

            // If so, then process the customerProfiles
            
            Map<id,SObject> accmap = new Map<id,SObject>();   
                
            accmap.putall(customerProfiles);
                
            upsert accmap.values();

        }

    }

}
