/**
 * @author Abraham David Lloyd
 * @date February 11th, 2021
 *
 * @description This class is used to retrieve B2C Commerce customer data and details
 * from custom object definitions.  Each customer should also have an associated
 * default customerList.
 */
public with sharing class B2CContactManager extends B2CBaseMeta {

    /**
     * @description Attempts to retrieve a Contact configured via custom objects.
     *
     * @param contactId {String} Describes the Contact identifier used to retrieve a given definition
     * @param returnEmptyObject {Boolean} Describes if an empty sObject should be returned if no results are found
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the fieldMappings
     * @return {Contact} Returns an instance of a Contact
     */
    public static Contact getContactById(String contactId, Boolean returnEmptyObject, List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {

        // Initialize local variables
        List<Contact> contacts;
        String errorMsg;
        Query contactQuery;
        Contact output;

        // Default the error message
        errorMsg = B2CConstant.buildErrorMessage(B2CConstant.Errors_Meta_ContactNotFound, contactId);

        // Seed the default query structure to leverage
        contactQuery = getDefaultQuery(fieldMappings);

        // Define the record limit for the query
        contactQuery.setLimit(1);

        // Define the default where-clause for the query
        contactQuery.addConditionEq('Id', contactId);

        // Execute the query and evaluate the results
        contacts = contactQuery.run();

        // Process the return results in a consistent manner
        output = (Contact)processReturnResult('Contact', returnEmptyObject, contacts, errorMsg);

        // Return the customerList result
        return output;

    }

    /**
     * @description Helper function that takes an existing contact, and fieldMappings -- and creates an
     * object representation only containing mapped B2C Commerce properties that can be updated via the
     * OCAPI Data REST API.
     *
     * @param customerProfile {Contact} Represents the contact being processed for B2C Commerce updates
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection of fieldMappings being evaluated
     * @return {Map<String, Object>} Returns an object representation of the properties to update
     */
    public static Map<String, Object> getPublishProfile(Contact customerProfile, List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {

        // Initialize local variables
        Map<String, Object> output;
        List<String> deleteNode;
        Map<String, Object> credentialsNode;
        Object contactPropertyValue;
        String OCAPISubKey;
        Boolean hasCredentialInfo;

        // Initialize the output map
        output = new Map<String, Object>();
        deleteNode = new List<String>();

        // Evaluate if credential details should be published to B2C Commerce
        hasCredentialInfo = hasParentProperty(fieldMappings, 'credentials');

        // Attach the contact and account Ids to the profile
        output.put('c_b2ccrm_accountId', customerProfile.AccountId);
        output.put('c_b2ccrm_contactId', customerProfile.Id);

        System.debug(output);

        // First, determine if this collection has credentials information to publish
        if (hasCredentialInfo == true) {
            credentialsNode = new Map<String, Object>();
        }

        // Loop over the collection of field mappings
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping: fieldMappings) {

            // Create a reference to the property value for this contact
            contactPropertyValue = customerProfile.get(thisFieldMapping.Service_Cloud_Attribute__c);

            // TODO How do we handle deletes for composite / parent-child customer profile nodes (ex. credentials)
            // Is this property empty and is this not a child node?  If so, then add it to the delete node
            if (contactPropertyValue == null && !thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c.contains('.')) {

                // If so, then add it to the delete node (fields to clear out)
                deleteNode.add(thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c);

            // Does the B2C Commerce attribute represent a child object-key?
            } else if (thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c.contains('credentials.')) {

                // Get the sub-key in question for the credentials node
                OCAPISubKey = thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c.replace('credentials.', '');

                // Attach the current property value to the credentials node
                credentialsNode.put(OCAPISubKey, contactPropertyValue);

            } else {

                // Otherwise, attach the OCAPI property value to the object root
                output.put(thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c, contactPropertyValue);

            }

        }

        // If we have credential updates, then include it in the output
        if (hasCredentialInfo == true) {
            output.put('credentials', credentialsNode);
        }

        // Do we have properties to delete?  If so, then include it in the output
        if (deleteNode.size() > 0) {
            output.put('_delete', deleteNode);
        }

        // Returns the output collection
        return output;

    }

    /**
     * @description Helper function to evaluate if the fieldMappings contain mapping definitions that include
     * a B2C Commerce OCAPI document parent property (ex. credentials.username).
     *
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the collection of field mappings being evaluated
     * @param propertyName {String} Describes the name of the parent property to search for
     * @return {Boolean} Returns true if the parent property exists and false if it does not
     */
    private static Boolean hasParentProperty(List<B2C_Integration_Field_Mappings__mdt> fieldMappings, String propertyName) {

        // Initialize local variables
        Boolean output;
        String parentPropertyLabel;

        // Default the output variable
        output = false;

        // Define the parent property
        parentPropertyLabel = propertyName + '.';

        // Loop over the collection of field mappings
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping: fieldMappings) {

            // Does the B2C Commerce attribute represent a child object-key?
            if (thisFieldMapping.B2C_Commerce_OCAPI_Attribute__c.contains(parentPropertyLabel)) {

                // Get the sub-key in question for the credentials node
                output = true;
                break;

            }

        }

        // Return the output variable
        return output;

    }

    /**
     * @description Helper method that provides a consistent set of columns to leverage
     * when selecting sObject data via SOQL
     *
     * @param fieldMappings {List<B2C_Integration_Field_Mappings__mdt>} Represents the fieldMappings
     * @return {Query} Returns the query template to leverage for customerLists
     */
    private static Query getDefaultQuery(List<B2C_Integration_Field_Mappings__mdt> fieldMappings) {

        // Initialize local variables
        Query contactQuery;

        // Create the profile query that will be used to drive resolution
        contactQuery = new Query('Contact');

        // Add the base fields to retrieve (identifiers first)
        contactQuery.selectField('Id');
        contactQuery.selectField('AccountId');
        contactQuery.selectField('B2C_CustomerList_ID__c');
        contactQuery.selectField('B2C_CustomerList__c');

        // Add the integration / audit control flags
        contactQuery.selectField('B2C_Disable_Integration__c');
        contactQuery.selectField('Audit_OCAPI_API_Response__c');

        // Include the audit fields tracking platformEvent and integration activity
        contactQuery.selectField('Last_Platform_Event_Processed_Date__c');
        contactQuery.selectField('Last_Platform_Event_Applied_Updates__c');
        contactQuery.selectField('Last_B2C_Commerce_Update_Processed__c');
        contactQuery.selectField('Last_Update_Pushed_to_B2C_Commerce__c');
        contactQuery.selectField('Total_Updates_From_B2C_Commerce__c');
        contactQuery.selectField('Total_Updates_to_B2C_Commerce__c');
        contactQuery.selectField('Updated_by_B2C_Platform_Event__c');

        // Iterate over the field mappings and attach the mapped fields to the query
        for (B2C_Integration_Field_Mappings__mdt thisFieldMapping: fieldMappings) {

            // Add the Salesforce Platform attribute to the query
            contactQuery.selectField(thisFieldMapping.Service_Cloud_Attribute__c);

        }

        // Return the default query structure
        return contactQuery;

    }

}
