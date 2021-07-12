/**
 * @author Abraham David Lloyd
 * @date June 17th, 2021
 *
 * @description This is the wrapper used by the authentication classes
 * class to capture and make available the B2C Commerce authToken REST response
*/
public class B2CIARequestB2CAuthTokenResult {

    ////////////////////////////////////////////////////////////////
    // Include the parent identifiers
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String b2cClientIdRecordId;

    @InvocableVariable
    public String b2cClientId;

    @InvocableVariable
    public Boolean auditAuthenticationAPIInteractions;

    @InvocableVariable
    public Boolean bypassAuthTokenAuditing;

    @InvocableVariable
    public Boolean persistAuthToken;

    ////////////////////////////////////////////////////////////////
    // Include the REST status properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String status;

    @InvocableVariable
    public Integer statusCode;

    ////////////////////////////////////////////////////////////////
    // Include the deserialized properties from the response
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String accessToken;

    @InvocableVariable
    public String tokenType;

    @InvocableVariable
    public Integer expiresIn;

    @InvocableVariable
    public String accountManagerUrl;

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
