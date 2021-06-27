/**
 * @author Abraham David Lloyd
 * @date February 7th, 2021
 *
 * @see B2CIAGetCustomerProfile.getCustomerProfile
 * @description This is a helper-class used by the B2CIAGetCustomerProfile class
 * to retrieve the details for a single / specified B2C Customer profile.
*/
public class B2CIAGetCustomerProfileResult {

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
    // Include the total records retrieved
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Integer totalRecords;

    ////////////////////////////////////////////////////////////////
    // Include any error messaging or detail flags
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;

}
