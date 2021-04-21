/**
 * @author Abraham David Lloyd
 * @date February 11th, 2021
 *
 * @see B2CIAGetCustomerProfile.getCustomerProfile
 * @description This is a helper-class used by the B2CIAGetCustomerProfile class
 * to retrieve the details for a single / specified B2C Commerce Customer Profile.
*/
public class B2CIAPublishCustomerProfileInput {

    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String accessToken;

    @InvocableVariable
    public String apiUrl;

    @InvocableVariable
    public String apiVersion;

    @InvocableVariable
    public String b2cCustomerListId;

    @InvocableVariable
    public String b2cCustomerNo;

    @InvocableVariable
    public String b2cCustomerId;

    @InvocableVariable
    public String crmCustomerListId;

    @InvocableVariable
    public String crmContactId;

    @InvocableVariable
    public Contact crmContact;

    @InvocableVariable
    public String b2cProfileJSON;

}
