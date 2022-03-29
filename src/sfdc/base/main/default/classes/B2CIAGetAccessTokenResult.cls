/**
 * @author Abraham David Lloyd
 * @date January 21st, 2021
 *
 * @description This is the wrapper used by the authentication classes
 * class to capture and make available the B2C Commerce authToken REST response
*/
public class B2CIAGetAccessTokenResult {

    ////////////////////////////////////////////////////////////////
    // Include the REST response properties
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String status;

    @InvocableVariable
    public Integer statusCode;

    @InvocableVariable
    public String responseBody;

    ////////////////////////////////////////////////////////////////
    // Include the deserialized properties from the response
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String accessToken;

    @InvocableVariable
    public String tokenType;

    @InvocableVariable
    public Integer expiresIn;

    ////////////////////////////////////////////////////////////////
    // Include any error messaging or detail flags
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Boolean isError;

    @InvocableVariable
    public String errorMessage;

    ////////////////////////////////////////////////////////////////
    // Include the B2C Commerce instance to scope requests from
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public String b2cInstanceAPIUrl;


    ////////////////////////////////////////////////////////////////
    // Include the deserialized properties from the response
    ////////////////////////////////////////////////////////////////

    @InvocableVariable
    public Integer totalPromotionsSize;

    @InvocableVariable
    public List<String> promotionIds;

}
