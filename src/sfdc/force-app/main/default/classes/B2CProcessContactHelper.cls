/**
 * @author Abraham David Lloyd
 * @date February 14th, 2021
 *
 * @description Helper class supporting the B2C ProcessContact trigger.
*/
public with sharing class B2CProcessContactHelper extends B2CBaseAttributeAssignment {

    /**
     * @description Helper function to maintain a map of B2C CustomerLists based on the
     * Contact records being processed.  This avoids the need to consistently query for B2C CustomerLists
     * as Contact records are processed within the trigger.
     *
     * @param b2cCustomerListId {String} Represents the customerList being evaluated
     * @param customerListMap {Map<String, B2C_CustomerList__c>} Represents the map of B2C CustomerList being maintained
     * @return {Map<String, B2C_CustomerList__c>} Returns an updated instance of B2C CustomerLists
     */
    public static Map<String, B2C_CustomerList__c> updateCustomerListMap(String b2cCustomerListId, Map<String, B2C_CustomerList__c> customerListMap) {

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
    public static Map<String, B2C_Instance__c> updateInstanceMap(String b2cInstanceName, Map<String, B2C_Instance__c> instanceMap) {

        // Initialize local variables
        B2C_Instance__c relatedInstance;

        // If the instanceMap already contains the customerList's parent instance -- continue
        if (instanceMap.containsKey(b2cInstanceName)) {
            return instanceMap;
        }

        // Retrieve the instance
        relatedInstance = [
          SELECT    Id,
                    Name,
                    Is_Active__c
          FROM      B2C_Instance__c
          WHERE     Name = :b2cInstanceName
          LIMIT     1
        ];

        // Add the instance to the map
        instanceMap.put(relatedInstance.Name, relatedInstance);

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
    public static B2CIAValidateContactInput getValidateContactInput(Contact contactRecord, B2C_Instance__c b2cInstance, B2C_CustomerList__c b2cCustomerList) {

        // Initialize local variables
        B2CIAValidateContactInput output;

        // Create an instance of the validateContactInput class
        output = new B2CIAValidateContactInput();

        // Seed the default properties of the class
        output.contact = contactRecord;
        output.b2cInstance = b2cInstance;
        output.customerList = b2cCustomerList;
        output.processMode = B2CConstant.Contact_Integration_ProcessMode_Publish;

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
     * updates via the OCAPI Data REST API.  This version includes the B2CProfileJSON to use in the update.
     *
     * @param validateContactInput {B2CIAValidateContactInput} Represents the source records for the Platform Event
     * @param B2CProfileJSON {String} Represents the B2C Profile JSON to use for the publish event
     * @return {Database.SaveResult} Returns the processing / saveResults for the Platform Event created
     */
    public static Database.SaveResult createPublishPlatformEvent(B2CIAValidateContactInput validateContactInput, String B2CProfileJSON) {

        // Initialize local variables
        B2C_Commerce_ProcessCustomerDetails__e thisPE;
        Database.SaveResult peSaveResult;

        // Default the platform event
        thisPE = new B2C_Commerce_ProcessCustomerDetails__e();

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
        thisPE.B2C_Profile_Publish_JSON__c = B2CProfileJSON;

        // Publish the Platform Event
        peSaveResult = EventBus.publish(thisPE);

        // Return the saveResult
        return peSaveResult;


    }

}
