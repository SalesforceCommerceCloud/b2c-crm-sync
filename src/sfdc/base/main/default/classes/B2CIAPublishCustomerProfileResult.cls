/**
 * @author Abraham David Lloyd
 * @date February 11th, 2021
 *
 * @see B2CIAPublishCustomerProfile.publishCustomerProfile
 * @description This is a helper-class used by the B2CIAPublishCustomerProfile class
 * to consume a contact, identify its B2C Commerce properties, and publish those details
 * to B2C Commerce.
*/
public class B2CIAPublishCustomerProfileResult {

    ////////////////////////////////////////////////////////////////
    // Include the customerList details from the PlatformEvent
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String crmContactId;

    @InvocableVariable
    public String crmCustomerListId;

    @InvocableVariable
    public String b2cCustomerListId;

    @InvocableVariable
    public String b2cCustomerId;

    @InvocableVariable
    public String b2cCustomerNo;

    ////////////////////////////////////////////////////////////////
    // Include the REST request properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Contact crmContact;

    @InvocableVariable
    public JSONParse b2cCustomerProfile;

    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String status;

    @InvocableVariable
    public Integer statusCode;

    @InvocableVariable
    public String apiUrl;

    @InvocableVariable
    public String requestBody;

    @InvocableVariable
    public String responseBody;

    ////////////////////////////////////////////////////////////////
    // Include any error messaging or detail flags
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;

}
