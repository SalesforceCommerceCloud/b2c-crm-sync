/**
 * @author Abraham David Lloyd
 * @date July 3rd, 2020
 *
 * @description This class is used to capture and centralize all application constants.
 * We use string labels for a number of different properties; this class abstracts
 * references to these strings so that they're only defined in one place.
 */
public with sharing class B2CConstant {

    /**
     * @description These properties represent error messages leveraged throughout the codebase.
     */
    public static final String

        // Define the different data exception names
        Errors_ExceptionName_DataRecordMissing = 'B2CMetaDataRecordMissingException',

        // Define the account / contact short-hand model names and mapping objects
        AccountContactModel_Standard = 'Standard',
        AccountContactModel_Person = 'Person',

        // Define the list of personAccount properties that should be removed from Contacts
        // We use this list to remove these properties in scenarios where PersonAccounts are
        // enabled and the Contact is seeded with PA properties that prevent updates
        PersonAccountProperties_ToRemove_AccountId = 'AccountId',
        PersonAccountProperties_ToRemove_CleanStatus = 'CleanStatus',
        PersonAccountProperties_ToRemove_Jigsaw = 'Jigsaw',
        PersonAccountProperties_ToRemove_ReportsToId = 'ReportsToId',

        // Define the processMode keys leveraged by B2C Customer Profile integration
        Contact_Integration_ProcessMode_Retrieve = 'retrieve',
        Contact_Integration_ProcessMode_Publish = 'publish',
        Contact_Integration_ProcessMode_Process = 'process',

        // Define the error messages related to integration configuration
        Errors_IntegrationConfig_UnknownProcessMode = '--> B2C Exception: Contact ProcessMode is invalid [{0}]; expected [{1}].',
        Errors_IntegrationConfig_DisabledOnContact = '--> B2C Exception: Integration for the specified Contact [{0}] has been disabled.',
        Errors_IntegrationConfig_CustomerListIsInActive = '--> B2C Exception: The specified customerList [{0}] is inactive.',
        Errors_IntegrationConfig_InstanceIsInActive = '--> B2C Exception: The specified Instance [{0}] is inactive.',
        Errors_IntegrationConfig_ProfileRetrievalDisabled = '--> B2C Exception: The Customer Profile retrieval for the customerList [{0}] is disabled.',
        Errors_IntegrationConfig_ProfilePublishingDisabled = '--> B2C Exception: The Customer Profile publishing for the customerList [{0}] is disabled.',
        Errors_IntegrationConfig_ContactUpdateDisabled = '--> B2C Exception: The Contact Updates for the customerList [{0}] are disabled.',

        // Define the error messages leveraged by the application
        Errors_Common_GetStatus = 'Error: received status code',
        Errors_Common_UnknownFieldMapping = '--> B2C Exception: B2C Field Mapping [{0}] not found in Object [{1}]',

        // Define the error messages related to OCAPI
        Errors_OCAPI_AccessTokenNotPresent = 'Error: access_token not present in response',
        Errors_OCAPI_Non200ErrorOccurred = 'Error: unable to successfully complete this request',

        // Define error messages related to meta-data management
        Errors_Meta_NoRecordsFoundQuery = '--> B2C MetaData --> No records were retrieved by your query.',
        Errors_Meta_CustomerListNotFound = '--> B2C MetaData --> No customer-list found mapped to CustomerList_ID__c [{0}]; please verify that this customer-list is defined and has a default storefront associated.',
        Errors_Meta_FieldMappingObjectNotFound = '--> B2C MetaData --> [{0}] field mappings not found; please ensure that field mappings are configured for this object-type.',
        Errors_Meta_NoActiveStorefrontFound = '--> B2C MetaData --> No active storefront found mapped to Site_ID__c [{0}]; please verify that this storefront is defined and active.',
        Errors_Meta_ContactNotFound = '--> B2C MetaData --> No Contact found mapped to Id [{0}]; please verify that this Contact record is defined.';

    // Define the contact process modes used to manage integration
    public static final List<String> contactProcessModes = new List<String>{
        Contact_Integration_ProcessMode_Retrieve,
        Contact_Integration_ProcessMode_Publish,
        Contact_Integration_ProcessMode_Process
    };

    // Define the collection of PersonAccount properties that we'll manually remove from Contact records
    // prior to processing an update to a personAccount's Contact record.
    public static final List<String> personAccountPropertiesToRemove = new List<String>{
        PersonAccountProperties_ToRemove_AccountId,
        PersonAccountProperties_ToRemove_CleanStatus,
        PersonAccountProperties_ToRemove_Jigsaw,
        PersonAccountProperties_ToRemove_ReportsToId
    };

    /**
     * @description This method is used to build / create error messages by tying together string
     * attributes with a base message.
     *
     * @param errorMessage {String} Represents the error message to create
     * @param messageAttribute1 {String} Represents the first attribute to attach to the error message
     * @return {String} Returns a string representing the full error message
     */
    public static String buildErrorMessage(String errorMessage, String messageAttribute1) {

        // Initialize local variables
        List<String> messageAttributes;
        String output;

        // Initialize the attribute manager
        messageAttributes = new List<String>();
        messageAttributes.add(messageAttribute1);

        // Build out the error message details
        output = String.format(errorMessage, messageAttributes);

        // Return the error message
        return output;

    }

    /**
     * @description This method is used to build / create error messages by tying together string
     * attributes with a base message.
     *
     * @param errorMessage {String} Represents the error message to create
     * @param messageAttribute1 {String} Represents the first attribute to attach to the error message
     * @param messageAttribute2 {String} Represents the second attribute to attach to the error message
     * @return {String} Returns a string representing the full error message
     */
    public static String buildErrorMessage(String errorMessage, String messageAttribute1, String messageAttribute2) {

        // Initialize local variables
        List<String> messageAttributes;
        String output;

        // Initialize the attribute manager
        messageAttributes = new List<String>();
        messageAttributes.add(messageAttribute1);
        messageAttributes.add(messageAttribute2);

        // Build out the error message details
        output = String.format(errorMessage, messageAttributes);

        // Return the error message
        return output;

    }

}
