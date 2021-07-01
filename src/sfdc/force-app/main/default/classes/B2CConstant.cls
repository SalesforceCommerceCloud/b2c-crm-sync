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

        // Define the string that will be used to test / exercise the existence of defined certificates
        CERTTEST_VALIDATECERTIFICATE_CANSIGN = '--> B2C Client ID Test --> Validating that the certificate' +
            ' associated to a B2C ClientID exists by attempting to use it.',
        ERRORS_B2CCLIENTID_UNABLETOVERIFYCERTIFICATE = '--> B2C Exception --> We could not find a certificate ' +
            ' with the JWT Certificate Name you specified.  Please double-check your value; this should map to the' +
            ' unique-name of an existing Salesforce certificate.',

        // Define the certificate that will be used
        CERTTEST_VALIDATE_TESTCERTIFICATENAME = 'b2ccrmsync_testing',

        // Define the standard authToken success value
        AUTHTEST_AUTHTOKEN = 'bf1d02e3-9477-436b-84e1-15868daa7984',

        // Define the different data exception names
        ERRORS_EXCEPTIONNAME_DATARECORDMISSING = 'B2CMetaDataRecordMissingException',

        // Define the error messages leveraged by the application
        ERRORS_COMMON_GETSTATUS = '--> B2C Exception --> received status code',
        ERRORS_COMMON_UNKNOWNFIELDMAPPING = '--> B2C Exception --> B2C Field Mapping [{0}] not found in Object [{1}]',

        // Define the error messages related to OCAPI
        ERRORS_OCAPI_ACCESSTOKENNOTPRESENT = '--> B2C Exception --> access_token not present in response',
        ERRORS_OCAPI_NON200ERROROCCURRED = '--> B2C Exception --> unable to successfully complete this request',

        // Define error messages related to meta-data management
        ERRORS_META_NORECORDSFOUNDQUERY = '--> B2C MetaData --> No records were retrieved by your query.',
        ERRORS_META_CUSTOMERLISTNOTFOUND = '--> B2C MetaData --> No customer-list found mapped to CustomerList_ID__c ' +
            '[{0}]; please verify that this customer-list is defined and has a default storefront associated.',
        ERRORS_META_FIELDMAPPINGOBJECTNOTFOUND = '--> B2C MetaData --> [{0}] field mappings not found; please ensure ' +
            'that field mappings are configured for this object-type.',
        ERRORS_META_NOACTIVESTOREFRONTFOUND = '--> B2C MetaData --> No active storefront found mapped to Site_ID__c ' +
            '[{0}]; please verify that this storefront is defined and active.',
        ERRORS_META_CONTACTNOTFOUND = '--> B2C MetaData --> No Contact found mapped to Id [{0}]; please verify that ' +
            'this Contact record is defined.',

        // Define the account / contact short-hand model names and mapping objects
        ACCOUNTCONTACTMODEL_STANDARD = 'Standard',
        ACCOUNTCONTACTMODEL_PERSON = 'Person',

        // Define the list of personAccount properties that should be removed from Contacts
        // We use this list to remove these properties in scenarios where PersonAccounts are
        // enabled and the Contact is seeded with PA properties that prevent updates
        PERSONACCOUNTPROPERTIES_TOREMOVE_ACCOUNTID = 'AccountId',
        PERSONACCOUNTPROPERTIES_TOREMOVE_CLEANSTATUS = 'CleanStatus',
        PERSONACCOUNTPROPERTIES_TOREMOVE_JIGSAW = 'Jigsaw',
        PERSONACCOUNTPROPERTIES_TOREMOVE_REPORTSTOID = 'ReportsToId',

        // Define the list of synchronization properties we skip when synchronizing the
        // delta between a sourceObject's properties and a targetObject's properties
        CONTACT_SYNCHRONIZEPROPERTIES_TOSKIP_ID = 'Id',
        CONTACT_SYNCHRONIZEPROPERTIES_TOSKIP_ATTRIBUTES = 'attributes',

        // Define the processMode keys leveraged by B2C Customer Profile integration
        CONTACT_INTEGRATION_PROCESSMODE_RETRIEVE = 'retrieve',
        CONTACT_INTEGRATION_PROCESSMODE_PUBLISH = 'publish',
        CONTACT_INTEGRATION_PROCESSMODE_PROCESS = 'process',
        CONTACT_INTEGRATION_PROCESSMODE_RESOLVE = 'resolve',

        // Define the error messages related to integration configuration
        ERRORS_INTEGRATIONCONFIG_UNKNOWNPROCESSMODE = '--> B2C Exception --> Contact ProcessMode is invalid [{0}];' +
            ' expected [{1}].',
        ERRORS_INTEGRATIONCONFIG_DISABLEDONCONTACT = '--> B2C Exception --> Integration for the specified' +
            ' Contact [{0}] has been disabled.',
        ERRORS_INTEGRATIONCONFIG_CUSTOMERLISTISINACTIVE = '--> B2C Exception --> The specified customerList' +
            ' [{0}] is inactive.',
        ERRORS_INTEGRATIONCONFIG_INSTANCEISINACTIVE = '--> B2C Exception --> The specified Instance [{0}] is inactive.',
        ERRORS_INTEGRATIONCONFIG_PROFILERETRIEVALDISABLED = '--> B2C Exception --> The Customer Profile retrieval' +
            ' for the customerList [{0}] is disabled.',
        ERRORS_INTEGRATIONCONFIG_PROFILEPUBLISHINGDISABLED = '--> B2C Exception --> The Customer Profile publishing' +
            ' for the customerList [{0}] is disabled.',
        ERRORS_INTEGRATIONCONFIG_CONTACTUPDATEDISABLED = '--> B2C Exception --> The Contact Updates for the ' +
            'customerList [{0}] are disabled.';

    // Define the contact process modes used to manage integration
    public static final List<String> CONTACTPROCESSMODES = new List<String>{
        CONTACT_INTEGRATION_PROCESSMODE_RETRIEVE,
        CONTACT_INTEGRATION_PROCESSMODE_PUBLISH,
        CONTACT_INTEGRATION_PROCESSMODE_PROCESS,
        CONTACT_INTEGRATION_PROCESSMODE_RESOLVE
    };

    // Define the collection of PersonAccount properties that we'll manually remove from Contact records
    // prior to processing an update to a personAccount's Contact record.
    public static final List<String> PERSONACCOUNTPROPERTIESTOREMOVE = new List<String>{
        PERSONACCOUNTPROPERTIES_TOREMOVE_ACCOUNTID,
        PERSONACCOUNTPROPERTIES_TOREMOVE_CLEANSTATUS,
        PERSONACCOUNTPROPERTIES_TOREMOVE_JIGSAW,
        PERSONACCOUNTPROPERTIES_TOREMOVE_REPORTSTOID
    };

    // Define the collection of Contact properties to skip when comparing objects for
    // synchronization purposes (updating the remaining fields from a sourceObject to
    // a targetObject).
    public static final List<String> SYNCHRONIZEPROPERTIESTOSKIP = new List<String>{
        CONTACT_SYNCHRONIZEPROPERTIES_TOSKIP_ID,
        CONTACT_SYNCHRONIZEPROPERTIES_TOSKIP_ATTRIBUTES
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
